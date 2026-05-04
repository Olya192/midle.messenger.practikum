import HTTPTransport from "./HTTPTransport";

jest.mock('../config/api', () => ({
  API_CONFIG: {
    BASE_URL: 'https://api.example.com'
  }
}));

// Создаем класс-мок для XMLHttpRequest
class MockXMLHttpRequest {
  static readonly UNSENT = 0 as const;
  static readonly OPENED = 1 as const;
  static readonly HEADERS_RECEIVED = 2 as const;
  static readonly LOADING = 3 as const;
  static readonly DONE = 4 as const;
  
  open = jest.fn();
  send = jest.fn();
  setRequestHeader = jest.fn();
  abort = jest.fn();
  getResponseHeader = jest.fn();
  getAllResponseHeaders = jest.fn();
  overrideMimeType = jest.fn();
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  dispatchEvent = jest.fn();
  
  withCredentials = false;
  responseType: XMLHttpRequestResponseType = '';
  status = 200;
  statusText = 'OK';
  response: string | ArrayBuffer | Blob | Document | object | null = null;
  responseURL = '';
  responseXML = null;
  timeout = 0;
  readyState = 4;
  upload = {} as XMLHttpRequestUpload;
  
  readonly UNSENT = 0 as const;
  readonly OPENED = 1 as const;
  readonly HEADERS_RECEIVED = 2 as const;
  readonly LOADING = 3 as const;
  readonly DONE = 4 as const;
  
  onload: ((this: XMLHttpRequest, ev: ProgressEvent) => void) | null = null;
  onerror: ((this: XMLHttpRequest, ev: ProgressEvent) => void) | null = null;
  ontimeout: ((this: XMLHttpRequest, ev: ProgressEvent) => void) | null = null;
  onabort: ((this: XMLHttpRequest, ev: ProgressEvent) => void) | null = null;
  onreadystatechange: ((this: XMLHttpRequest, ev: Event) => void) | null = null;
  onprogress: ((this: XMLHttpRequest, ev: ProgressEvent) => void) | null = null;
  onloadstart: ((this: XMLHttpRequest, ev: ProgressEvent) => void) | null = null;
  onloadend: ((this: XMLHttpRequest, ev: ProgressEvent) => void) | null = null;
  
  responseText = '';
}

describe('HTTPTransport', () => {
  let httpTransport: HTTPTransport;
  let originalXHR: typeof XMLHttpRequest;

  beforeEach(() => {
    originalXHR = global.XMLHttpRequest;
    global.XMLHttpRequest = MockXMLHttpRequest as unknown as typeof XMLHttpRequest;
    httpTransport = new HTTPTransport();
  });

  afterEach(() => {
    global.XMLHttpRequest = originalXHR;
    jest.clearAllMocks();
  });

  test('GET запрос успешно возвращает данные', async () => {
    const mockXHRInstance = new MockXMLHttpRequest();
    const mockData = { id: 1, name: 'Test' };
    mockXHRInstance.responseText = JSON.stringify(mockData);
    mockXHRInstance.getResponseHeader.mockReturnValue('application/json');
    mockXHRInstance.status = 200;
    
    // Мокаем конструктор, чтобы вернуть наш экземпляр
    const mockConstructor = jest.fn().mockImplementation(() => mockXHRInstance);
    Object.assign(mockConstructor, MockXMLHttpRequest);
    global.XMLHttpRequest = mockConstructor as unknown as typeof XMLHttpRequest;
    
    httpTransport = new HTTPTransport();
    
    // Вызываем onload синхронно
    mockXHRInstance.send = jest.fn().mockImplementation(() => {
      mockXHRInstance.onload?.(new ProgressEvent('load'));
    });
    
    const promise = httpTransport.get('/users/1');
    const result = await promise;
    
    expect(result).toEqual(mockData);
    expect(mockXHRInstance.open).toHaveBeenCalledWith('GET', 'https://api.example.com/users/1');
    expect(mockXHRInstance.send).toHaveBeenCalled();
  });

  test('POST запрос отправляет данные и получает ответ', async () => {
    const mockXHRInstance = new MockXMLHttpRequest();
    const postData = { name: 'User' };
    mockXHRInstance.responseText = JSON.stringify({ id: 1, ...postData });
    mockXHRInstance.getResponseHeader.mockReturnValue('application/json');
    mockXHRInstance.status = 200;
    
    const mockConstructor = jest.fn().mockImplementation(() => mockXHRInstance);
    Object.assign(mockConstructor, MockXMLHttpRequest);
    global.XMLHttpRequest = mockConstructor as unknown as typeof XMLHttpRequest;
    
    httpTransport = new HTTPTransport();
    
    mockXHRInstance.send = jest.fn().mockImplementation(() => {
      mockXHRInstance.onload?.(new ProgressEvent('load'));
    });
    
    const promise = httpTransport.post('/users', { data: postData });
    const result = await promise;
    
    expect(result).toEqual({ id: 1, name: 'User' });
    expect(mockXHRInstance.send).toHaveBeenCalledWith(JSON.stringify(postData));
  });

  test('Обработка ошибки 404', async () => {
    const mockXHRInstance = new MockXMLHttpRequest();
    mockXHRInstance.status = 404;
    mockXHRInstance.statusText = 'Not Found';
    mockXHRInstance.responseText = 'User not found';
    
    const mockConstructor = jest.fn().mockImplementation(() => mockXHRInstance);
    Object.assign(mockConstructor, MockXMLHttpRequest);
    global.XMLHttpRequest = mockConstructor as unknown as typeof XMLHttpRequest;
    
    httpTransport = new HTTPTransport();
    
    mockXHRInstance.send = jest.fn().mockImplementation(() => {
      mockXHRInstance.onload?.(new ProgressEvent('load'));
    });
    
    const promise = httpTransport.get('/users/999');
    
    await expect(promise).rejects.toMatchObject({
      status: 404,
      statusText: 'Not Found'
    });
  });

  test('Обработка сетевой ошибки', async () => {
    const mockXHRInstance = new MockXMLHttpRequest();
    
    const mockConstructor = jest.fn().mockImplementation(() => mockXHRInstance);
    Object.assign(mockConstructor, MockXMLHttpRequest);
    global.XMLHttpRequest = mockConstructor as unknown as typeof XMLHttpRequest;
    
    httpTransport = new HTTPTransport();
    
    mockXHRInstance.send = jest.fn().mockImplementation(() => {
      mockXHRInstance.onerror?.(new ProgressEvent('error'));
    });
    
    const promise = httpTransport.get('/users');
    
    await expect(promise).rejects.toMatchObject({
      reason: 'Network error'
    });
  });

  test('Установка кастомных заголовков', async () => {
    const mockXHRInstance = new MockXMLHttpRequest();
    mockXHRInstance.responseText = JSON.stringify({});
    mockXHRInstance.getResponseHeader.mockReturnValue('application/json');
    mockXHRInstance.status = 200;
    
    const mockConstructor = jest.fn().mockImplementation(() => mockXHRInstance);
    Object.assign(mockConstructor, MockXMLHttpRequest);
    global.XMLHttpRequest = mockConstructor as unknown as typeof XMLHttpRequest;
    
    httpTransport = new HTTPTransport();
    
    mockXHRInstance.send = jest.fn().mockImplementation(() => {
      mockXHRInstance.onload?.(new ProgressEvent('load'));
    });
    
    const promise = httpTransport.get('/users', {
      headers: { 'Authorization': 'Bearer token123' }
    });
    
    await promise;
    expect(mockXHRInstance.setRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer token123');
  });
});
