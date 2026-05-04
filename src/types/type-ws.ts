// types/websocket.ts

// Типы сообщений
export type WebSocketMessageType = 'message' | 'get old' | 'ping' | 'user connected';
export type ServerMessageType = 'message' | 'file' | 'user connected' | 'pong';

// Исходящие сообщения
export interface BaseClientMessage {
  type: WebSocketMessageType;
}

export interface TextMessage extends BaseClientMessage {
  type: 'message';
  content: string;
}

export interface GetOldMessagesMessage extends BaseClientMessage {
  type: 'get old';
  content: string; // строковое представление числа offset или id
}

export interface PingMessage extends BaseClientMessage {
  type: 'ping';
}

export type ClientMessage = TextMessage | GetOldMessagesMessage | PingMessage;

// Структура файла в сообщении
export interface FileInfo {
  id: number;
  user_id: number;
  path: string;
  filename: string;
  content_type: string;
  content_size: number;
  upload_date: string;
}

// Входящее сообщение с файлом
export interface FileMessage {
  id: number;
  chat_id: number;
  time: string;
  type: 'file';
  user_id: number;
  content: string;
  file: FileInfo;
}

// Входящее текстовое сообщение
export interface TextMessageResponse {
  id: number;
  time: string;
  user_id: number;
  content: string;
  type: 'message';
}

// Системное сообщение о подключении пользователя
export interface UserConnectedMessage {
  content: string; // строковое id подключенного пользователя
  type: 'user connected';
}

// Pong ответ
export interface PongMessage {
  type: 'pong';
}

// Все возможные входящие сообщения
export type ServerMessage = TextMessageResponse | FileMessage | UserConnectedMessage | PongMessage;

// Массив старых сообщений (ответ на get old)
export type OldMessagesResponse = ServerMessage[];

// Параметры подключения
export interface ConnectParams {
  chatId: number | string;
  userId: number | string;
  token: string;
  saveData: (data: string) => void;
}

// Очередь сообщений
export type MessageQueueItem = ClientMessage;

// WebSocket события
export interface WebSocketErrorEvent extends Event {
  message?: string;
}

export interface WebSocketCloseEvent extends CloseEvent {
  wasClean: boolean;
  code: number;
  reason: string;
}

export function isTextMessage(msg: ServerMessage): msg is TextMessageResponse {
  return msg.type === 'message';
}

export function isFileMessage(msg: ServerMessage): msg is FileMessage {
  return msg.type === 'file';
}

export function isUserConnectedMessage(msg: ServerMessage): msg is UserConnectedMessage {
  return msg.type === 'user connected';
}

export function isPongMessage(msg: ServerMessage): msg is PongMessage {
  return msg.type === 'pong';
}

export function isNewMessage(msg: ServerMessage): msg is TextMessageResponse | FileMessage {
  return ('id' in msg && typeof msg.id === 'number');
}

export function isOldMessagesResponse(data: unknown): data is ServerMessage[] {
  return Array.isArray(data) && data.length > 0 && 'time' in data[0];
}
