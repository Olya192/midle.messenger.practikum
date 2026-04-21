import HTTPTransport from "../modules/HTTPTransport";
import Store from "../store/Store";

export interface ChatUser {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
  role: "admin" | "regular";
}

export interface LastMessage {
  user: ChatUser;
  time: string;
  content: string;
}

export interface Chat {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  created_by: number;
  last_message: {
    user: {
      id: number;
      first_name: string;
      second_name: string;
      display_name: string;
      login: string;
      email: string;
      phone: string;
      avatar: string;
      role: string;
    };
    time: string;
    content: string;
  } | null;
}

export interface CreateChatRequest {
  title: string;
}

export interface CreateChatResponse {
  id: number;
}

export interface DeleteChatRequest {
  chatId: number;
}

export interface DeleteChatResponse {
  userId: number;
  result: {
    id: number;
    title: string;
    avatar: string | null;
    created_by: number;
  };
}

export interface GetChatsParams {
  offset?: number;
  limit?: number;
  title?: string;
}

export interface GetChatUsersParams {
  offset?: number;
  limit?: number;
  name?: string;
  email?: string;
}

export interface AddUsersToChatRequest {
  users: number[];
  chatId: number;
}

export interface DeleteUsersFromChatRequest {
  users: number[];
  chatId: number;
}

export interface GetChatTokenResponse {
  token: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

// api/ChatAPI.ts
const chatAPIInstance = new HTTPTransport({
  baseURL: "https://ya-praktikum.tech/api/v2",
  defaultCredentials: "include",
  defaultHeaders: {
    "Content-Type": "application/json",
  },
  defaultTimeout: 10000,
});

export class ChatAPI {
  // GET /chats - Получить список чатов
  getChats(params: GetChatsParams = {}): Promise<Chat[]> {
    const queryParams: Record<string, string> = {};

    if (params.offset !== undefined) {
      queryParams.offset = String(params.offset);
    }
    if (params.limit !== undefined) {
      queryParams.limit = String(params.limit);
    }
    if (params.title !== undefined) {
      queryParams.title = params.title;
    }

    const queryString =
      Object.keys(queryParams).length > 0
        ? `?${new URLSearchParams(queryParams).toString()}`
        : "";

    return chatAPIInstance.get<Chat[]>(`/chats${queryString}`);
  }

  // POST /chats - Создать новый чат
  createChat(data: CreateChatRequest): Promise<CreateChatResponse> {
    return chatAPIInstance.post<CreateChatResponse>("/chats", {
      data,
    });
  }

  // DELETE /chats - Удалить чат
  deleteChat(data: DeleteChatRequest): Promise<DeleteChatResponse> {
    return chatAPIInstance.delete<DeleteChatResponse>("/chats", {
      data,
    });
  }

  // GET /chats/{id}/users - Получить пользователей чата
  getChatUsers(
    chatId: number,
    params: GetChatUsersParams = {},
  ): Promise<ChatUser[]> {
    const queryParams: Record<string, string> = {};

    if (params.offset !== undefined) {
      queryParams.offset = String(params.offset);
    }
    if (params.limit !== undefined) {
      queryParams.limit = String(params.limit);
    }
    if (params.name !== undefined) {
      queryParams.name = params.name;
    }
    if (params.email !== undefined) {
      queryParams.email = params.email;
    }

    const queryString =
      Object.keys(queryParams).length > 0
        ? `?${new URLSearchParams(queryParams).toString()}`
        : "";

    return chatAPIInstance.get<ChatUser[]>(
      `/chats/${chatId}/users${queryString}`,
    );
  }

  // PUT /chats/users - Добавить пользователей в чат
  addUsersToChat(data: AddUsersToChatRequest): Promise<void> {
    return chatAPIInstance.put<void>("/chats/users", {
      data,
    });
  }

  // DELETE /chats/users - Удалить пользователей из чата
  deleteUsersFromChat(data: DeleteUsersFromChatRequest): Promise<void> {
    return chatAPIInstance.delete<void>("/chats/users", {
      data,
    });
  }

  // POST /chats/token/{id} - Получить токен для WebSocket соединения
  getChatToken(chatId: number): Promise<GetChatTokenResponse> {
    return chatAPIInstance.post<GetChatTokenResponse>(`/chats/token/${chatId}`);
  }

  // GET /chats/new/{id} - Получить количество непрочитанных сообщений
  getUnreadCount(chatId: number): Promise<UnreadCountResponse> {
    return chatAPIInstance.get<UnreadCountResponse>(`/chats/new/${chatId}`);
  }

  // PUT /chats/avatar - Обновить аватар чата
  updateChatAvatar(chatId: number, avatar: File): Promise<Chat> {
    const formData = new FormData();
    formData.append("chatId", String(chatId));
    formData.append("avatar", avatar);

    return chatAPIInstance.put<Chat>("/chats/avatar", {
      data: formData,
    });
  }

  // Вспомогательные методы для работы со Store
  async refreshChatsList(params: GetChatsParams = {}): Promise<Chat[]> {
    const chats = await this.getChats(params);
    Store.setState("chats", chats);
    return chats;
  }

  async loadChatUsers(chatId: number): Promise<ChatUser[]> {
    const users = await this.getChatUsers(chatId);
    Store.setState(`chatUsers.${chatId}`, users);
    return users;
  }

  async createChatAndRefresh(
    data: CreateChatRequest,
  ): Promise<CreateChatResponse> {
    const response = await this.createChat(data);
    // Обновляем список чатов после создания нового
    await this.refreshChatsList();
    return response;
  }

  async deleteChatAndRefresh(chatId: number): Promise<DeleteChatResponse> {
    const response = await this.deleteChat({ chatId });
    // Обновляем список чатов после удаления
    await this.refreshChatsList();
    return response;
  }

  // Методы BaseAPI
  create(data: CreateChatRequest) {
    return this.createChat(data);
  }

  request(params: GetChatsParams = {}) {
    return this.getChats(params);
  }

  update() {
    throw new Error(
      "Method not implemented. Use specific methods like updateChatAvatar",
    );
  }

  // delete(data: DeleteChatRequest) {
  //   return this.deleteChat(data);
  // }
}
