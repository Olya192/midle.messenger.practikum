// services/ChatWebSocketService.ts
export type WebSocketMessageType =
  | "message"
  | "get old"
  | "ping"
  | "pong"
  | "user connected"
  | "file";

export interface SendMessageRequest {
  type: "message";
  content: string;
}

export interface GetOldMessagesRequest {
  type: "get old";
  content: string;
}

export interface PingRequest {
  type: "ping";
}

export interface ServerMessageResponse {
  id: string;
  time: string;
  user_id: string;
  content: string;
  type: "message";
}

export interface ServerFileMessageResponse {
  chat_id: string;
  time: string;
  type: "file";
  user_id: string;
  content: string;
  file: {
    id: string;
    user_id: string;
    path: string;
    filename: string;
    content_type: string;
    content_size: number;
    upload_date: string;
  };
}

export interface OldMessageResponse {
  chat_id: string;
  time: string;
  type: "message" | "file";
  user_id: string;
  content: string;
  file?: {
    id: string;
    user_id: string;
    path: string;
    filename: string;
    content_type: string;
    content_size: number;
    upload_date: string;
  };
}

export type WebSocketResponse =
  | ServerMessageResponse
  | ServerFileMessageResponse
  | { type: "pong" }
  | { type: "user connected"; content: string }
  | OldMessageResponse[];

export interface WebSocketEventHandlers {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: ServerMessageResponse) => void;
  onFileMessage?: (message: ServerFileMessageResponse) => void;
  onUserConnected?: (userId: string) => void;
  onOldMessages?: (messages: OldMessageResponse[]) => void;
  onPong?: () => void;
}

interface QueuedMessage {
  type: WebSocketMessageType;
  content?: string;
}

export class ChatWebSocketService {
  private socket: WebSocket | null = null;
  private chatId: string;
  private token: string;
  private userId: number;
  private pingInterval: number | null = null;
  private isConnected = false;
  private isConnectingFlag = false; // ДОБАВИТЬ: флаг процесса подключения
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: WebSocketEventHandlers = {};
  private messageQueue: QueuedMessage[] = [];
  private connectionPromise: Promise<void> | null = null; 
  
   isConnecting(): boolean {
    return this.isConnectingFlag || this.socket?.readyState === WebSocket.CONNECTING;
  }

   getReadyState(): number | null {
    return this.socket?.readyState ?? null;
  }

  constructor(chatId: string, token: string, userId: number) {
    this.chatId = chatId;
    this.token = token;
    this.userId = userId;
  }

  private getWebSocketUrl(): string {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = import.meta?.env?.VITE_WS_HOST || "localhost:3000";
    return `${wsProtocol}//${host}/chats/${this.chatId}`;
  }

   connect(handlers: WebSocketEventHandlers): Promise<void> {
    this.handlers = handlers;
    this.isConnectingFlag = true; // ДОБАВИТЬ
    
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const wsUrl = this.getWebSocketUrl();
        this.socket = new WebSocket(wsUrl);
        console.log("start websocket");
        console.log("this.chatId", this.chatId);
        
        const timeout = setTimeout(() => {
          this.isConnectingFlag = false;
          reject(new Error("Connection timeout"));
        }, 10000);
        
        this.socket.onopen = (event) => {
          clearTimeout(timeout);
          this.handleOpen(event);
          resolve();
        };
        
        this.socket.onclose = (event) => {
          clearTimeout(timeout);
          this.handleClose(event);
          reject(new Error(`Connection closed: ${event.code}`));
        };
        
        this.socket.onerror = (event) => {
          clearTimeout(timeout);
          this.isConnectingFlag = false;
          this.handleError(event);
          reject(event);
        };
        
        this.socket.onmessage = this.handleMessage.bind(this);
      } catch (error) {
        this.isConnectingFlag = false;
        console.error("Failed to create WebSocket connection:", error);
        this.handleReconnect();
        reject(error);
      }
    });
    
    return this.connectionPromise;
  }

   private handleOpen(event: Event): void {
    console.log(`WebSocket connected to chat ${this.chatId}`);
    this.isConnected = true;
    this.isConnectingFlag = false; // ДОБАВИТЬ
    this.reconnectAttempts = 0;
    this.flushMessageQueue();
    this.startPingInterval();
    this.handlers.onOpen?.(event);
  }

  private handleClose(event: CloseEvent): void {
    console.log(
      `WebSocket disconnected from chat ${this.chatId}`,
      event.code,
      event.reason,
    );
    this.isConnected = false;
    this.isConnectingFlag = false; // ДОБАВИТЬ
    this.stopPingInterval();

    const wasConnecting = this.socket?.readyState === WebSocket.CONNECTING;

    this.handlers.onClose?.(event);

    // Не переподключаемся при нормальном закрытии (code 1000) или если соединение не было установлено
    if (event.code !== 1000 && !wasConnecting) {
      this.handleReconnect();
    }
  }

 async sendTextMessageAsync(content: string): Promise<void> {
    // Ждем подключения, если оно еще не установлено
    if (this.connectionPromise) {
      try {
        await this.connectionPromise;
      } catch (error) {
        console.error("Failed to connect:", error);
        throw error;
      }
    }
    
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      const message: SendMessageRequest = {
        type: "message",
        content
      };
      this.socket.send(JSON.stringify(message));
    } else {
      // Сохраняем в очередь
      this.messageQueue.push({ type: "message", content });
      console.log(`Message queued for chat ${this.chatId}:`, content);
    }
  }

  private handleError(event: Event): void {
    console.error("WebSocket error:", event);
    this.handlers.onError?.(event);
  }

  private handleMessage(event: MessageEvent): void {
    console.log('handleMessage')
    try {
      const data = JSON.parse(event.data) as WebSocketResponse;

      if (Array.isArray(data)) {
        this.handlers.onOldMessages?.(data);
      } else if (data.type === "pong") {
        this.handlers.onPong?.();
      } else if (data.type === "user connected") {
        this.handlers.onUserConnected?.(data.content);
      } else if (data.type === "message") {
        this.handlers.onMessage?.(data);
      } else if (data.type === "file") {
        this.handlers.onFileMessage?.(data);
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  }

  private startPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = window.setInterval(() => {
      this.sendPing();
    }, 30000);
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect(this.handlers);
      }
    }, delay);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      }
    }
  }

  private send(
    message: SendMessageRequest | GetOldMessagesRequest | PingRequest,
  ): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  sendTextMessage(content: string): void {
    const message: SendMessageRequest = {
      type: "message",
      content,
    };
    this.send(message);
  }

  sendPing(): void {
    const pingMessage: PingRequest = {
      type: "ping",
    };
    this.send(pingMessage);
  }

  getOldMessages(offsetOrId: string): void {
    const request: GetOldMessagesRequest = {
      type: "get old",
      content: offsetOrId,
    };
    this.send(request);
  }

  async getAllUnreadMessages(
    chatId: number,
    getUnreadCount: () => Promise<{ unread_count: number }>,
  ): Promise<OldMessageResponse[]> {
    try {
      const unreadCountResponse = await getUnreadCount();
      const totalUnread = unreadCountResponse.unread_count;

      const allMessages: OldMessageResponse[] = [];
      let offset = 0;
      const limit = 20;

      while (offset < totalUnread) {
        const messages = await this.getOldMessagesPromise(String(offset));
        if (messages && messages.length > 0) {
          allMessages.push(...messages);
        }
        offset += limit;
      }

      return allMessages.reverse();
    } catch (error) {
      console.error("Failed to get all unread messages:", error);
      return [];
    }
  }

  private getOldMessagesPromise(offset: string): Promise<OldMessageResponse[]> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout getting old messages"));
      }, 10000);

      const handler = (messages: OldMessageResponse[]) => {
        clearTimeout(timeout);
        if (this.handlers.onOldMessages) {
          this.handlers.onOldMessages = originalHandler;
        }
        resolve(messages);
      };

      const originalHandler = this.handlers.onOldMessages;
      this.handlers.onOldMessages = handler;

      this.getOldMessages(offset);
    });
  }

  disconnect(): void {
    this.stopPingInterval();
    this.isConnectingFlag = false; // ДОБАВИТЬ
    this.connectionPromise = null; // ДОБАВИТЬ

    if (this.socket) {
      const state = this.socket.readyState;

      // Только если соединение открыто или устанавливается
      if (state === WebSocket.OPEN) {
        this.socket.close(1000, "Normal closure");
      } else if (state === WebSocket.CONNECTING) {
        // Для соединяющихся сокетов, ждем открытия и сразу закрываем
        const onOpen = () => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.close(1000, "Normal closure");
          }
          if (this.socket) {
            this.socket.removeEventListener("open", onOpen);
          }
        };
        this.socket.addEventListener("open", onOpen);

        // Таймаут на случай, если соединение зависло
        setTimeout(() => {
          if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
            this.socket.removeEventListener("open", onOpen);
            this.socket = null;
          }
        }, 5000);
      }

      this.socket = null;
    }

    this.isConnected = false;
    this.messageQueue = [];
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }
}
