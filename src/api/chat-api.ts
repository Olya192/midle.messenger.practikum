import { BaseAPI } from "../modules/http/base-api";
import HTTPTransport from "../modules/HTTPTransport";

 const chatAPIInstance = new HTTPTransport('/api/v1/chats');

export class ChatAPI extends BaseAPI {
  create(title: string) {
    // POST запрос на /api/v1/chats/
    return chatAPIInstance.post('/', { 
      data: { title } 
    });
  }

  request() {
    // GET запрос на /api/v1/chats/full
    return chatAPIInstance.get('/full');
  }
  
  delete(chatId: number) {
    // DELETE запрос на /api/v1/chats/123
    return chatAPIInstance.delete(`/${chatId}`);
  }
}

