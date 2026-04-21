// Типы для HTTP методов
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Константы методов
const METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

// Тип для данных запроса
type RequestData = object | FormData | string | null | undefined;

// Тип для заголовков
type RequestHeaders = Record<string, string>;

type RequestCredentials = "include" | "omit" | "same-origin";

// Тип для ответа XMLHttpRequest
type XMLHttpRequestResponseType =
  | ""
  | "arraybuffer"
  | "blob"
  | "document"
  | "json"
  | "text";

// Тип для возможных типов ответа
type ResponseData =
  | string
  | ArrayBuffer
  | Blob
  | Document
  | Record<string, unknown>
  | null;

// Интерфейс для опций запроса
interface RequestOptions {
  headers?: RequestHeaders;
  method?: HttpMethod;
  data?: RequestData;
  responseType?: XMLHttpRequestResponseType;
  timeout?: number;
  credentials?: RequestCredentials;
}

// Интерфейс для ошибки запроса
interface RequestError {
  status?: number;
  statusText?: string;
  response?: string;
  request?: XMLHttpRequest;
  reason?: string;
  timeout?: number;
}

interface HTTPTransportConfig {
  baseURL: string;
  defaultCredentials?: RequestCredentials;
  defaultHeaders?: RequestHeaders;
  defaultTimeout?: number;
}

// Утилитарная функция для преобразования объекта в query string
function queryStringify(data: Record<string, unknown>): string {
  if (typeof data !== "object" || data === null) {
    throw new Error("Data must be a non-null object");
  }

  const keys = Object.keys(data);

  if (keys.length === 0) {
    return "";
  }

  return keys.reduce<string>((result, key, index) => {
    const value = data[key];

    if (value === undefined || value === null) {
      return result;
    }

    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(String(value));

    const separator = index < keys.length - 1 ? "&" : "";

    return `${result}${encodedKey}=${encodedValue}${separator}`;
  }, "?");
}


class HTTPTransport {
  private baseURL: string;
  private defaultCredentials: RequestCredentials;
  private defaultHeaders: RequestHeaders;
  private defaultTimeout: number;

  constructor(config: HTTPTransportConfig | string = '') {
    if (typeof config === 'string') {
      this.baseURL = config;
      this.defaultCredentials = 'omit';
      this.defaultHeaders = {};
      this.defaultTimeout = 5000;
    } else {
      this.baseURL = config.baseURL;
      this.defaultCredentials = config.defaultCredentials ?? 'omit';
      this.defaultHeaders = config.defaultHeaders ?? {};
      this.defaultTimeout = config.defaultTimeout ?? 5000;
    }
  }

  private getFullUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      return url;
    }
    return `${this.baseURL}${url}`;
  }

  async get<T = ResponseData>(
    url: string, 
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(
      this.getFullUrl(url), 
      { ...options, method: METHODS.GET }, 
      options.timeout
    );
  }

  async post<T = ResponseData>(
    url: string, 
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(
      this.getFullUrl(url), 
      { ...options, method: METHODS.POST }, 
      options.timeout
    );
  }

  async put<T = ResponseData>(
    url: string, 
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(
      this.getFullUrl(url), 
      { ...options, method: METHODS.PUT }, 
      options.timeout
    );
  }

  async delete<T = ResponseData>(
    url: string, 
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(
      this.getFullUrl(url), 
      { ...options, method: METHODS.DELETE }, 
      options.timeout
    );
  }

  private request<T>(
    url: string,
    options: RequestOptions = {},
    timeout?: number
  ): Promise<T> {
    const {
      headers = {},
      method,
      data,
      responseType,
      credentials: requestCredentials,
    } = options;

    // Определяем credentials с приоритетом: опции запроса > дефолтные
    const credentials = requestCredentials ?? this.defaultCredentials;

    return new Promise<T>((resolve, reject) => {
      if (!method) {
        reject(new Error('HTTP method is required'));
        return;
      }

      const xhr = new XMLHttpRequest();
      const isGet = method === METHODS.GET;

      let requestUrl = url;
      if (isGet && data && typeof data === 'object' && !(data instanceof FormData)) {
        requestUrl = `${url}${queryStringify(data as Record<string, unknown>)}`;
      }

      xhr.open(method, requestUrl);

      // Устанавливаем withCredentials для поддержки cookies
      if (credentials === 'include') {
        xhr.withCredentials = true;
      }

      if (responseType !== undefined) {
        xhr.responseType = responseType;
      }

      // Применяем дефолтные заголовки
      const allHeaders: RequestHeaders = { ...this.defaultHeaders, ...headers };

      Object.entries(allHeaders).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let response: unknown;

          if (responseType !== undefined && responseType !== '') {
            response = xhr.response;
          } else {
            try {
              const contentType = xhr.getResponseHeader('Content-Type');
              if (contentType?.includes('application/json')) {
                response = JSON.parse(xhr.responseText) as Record<string, unknown>;
              } else {
                response = xhr.responseText;
              }
            } catch {
              response = xhr.responseText;
            }
          }

          resolve(response as T);
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
            request: xhr,
          } satisfies RequestError);
        }
      };

      xhr.onabort = () =>
        reject({
          reason: 'Request aborted',
          request: xhr,
        } satisfies RequestError);

      xhr.onerror = () =>
        reject({
          reason: 'Network error',
          request: xhr,
        } satisfies RequestError);

      const requestTimeout = timeout ?? this.defaultTimeout;
      xhr.timeout = requestTimeout;

      xhr.ontimeout = () =>
        reject({
          reason: 'Request timeout',
          timeout: requestTimeout,
          request: xhr,
        } satisfies RequestError);

      if (isGet || !data) {
        xhr.send();
      } else if (data instanceof FormData) {
        xhr.send(data);
      } else if (typeof data === 'object' && data !== null) {
        if (!allHeaders['Content-Type']) {
          xhr.setRequestHeader('Content-Type', 'application/json');
        }
        xhr.send(JSON.stringify(data));
      } else {
        xhr.send(data);
      }
    });
  }
}

export default HTTPTransport;
export type { RequestOptions, RequestError, ResponseData, HttpMethod };
