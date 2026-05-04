import type {
  ConnectParams,
  MessageQueueItem,
  WebSocketErrorEvent,
  WebSocketCloseEvent,
  GetOldMessagesMessage,
  PingMessage,
} from "../types/type-ws";

export let socket: WebSocket | null = null;
let messagesQueue: MessageQueueItem[] = [];


export function connect({ chatId, userId, token, saveData }: ConnectParams): void {
  console.log("connect", chatId, userId, token);
  if (!chatId || !userId || !token) {
    console.log("не пераданны данные");
    if (socket) socket.close();
    socket = null;
    return;
  }
  if (socket) socket.close();
  socket = new WebSocket(
    `wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${token}`,
  );

  socket.addEventListener("open", onOpen); // Соединение установлено.
  socket.addEventListener("message", (event) => onMessage({ event, saveData })); // Пришло новое сообщение.
  socket.addEventListener("error", onError); // Ошибка.
  socket.addEventListener("close", onClose); // Сокет закрылся.
  console.log("socet", socket);
}

export function sendMessage(content: string) {
  if (!socket) {
    console.log("не инициализирован вебсокет");
    return;
  }

  console.log("sendMessage", socket);
  console.log("sendMessage content", content);

  if (socket.readyState === 1) {
    socket.send(
      JSON.stringify({
        content: content,
        type: "message",
      }),
    );
  } else {
    messagesQueue.push({
      content: content,
      type: "message",
    });
  }
}

export function getMessages(offset: number = 0) {
  if (!socket) {
    console.log("не инициализирован вебсокет");
    return;
  }

 
  const message: GetOldMessagesMessage = {
    content: String(offset),
    type: "get old",
  };

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    messagesQueue.push(message);
  }
}

export function sendPing(): void {
  if (!socket) return;
  
  const pingMessage: PingMessage = { type: "ping" };
  
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(pingMessage));
  }
}


function onOpen(event: Event): void {
  console.log("Соединение установлено",event);
  if (messagesQueue.length > 0) {
    for (const message of messagesQueue) {
      if (socket) socket.send(JSON.stringify(message));
    }
    messagesQueue = [];
  }
}

function onMessage({ event, saveData }:{ event: MessageEvent; saveData: (data: string) => void }): void {
  saveData(event.data);
}

function onError(event: WebSocketErrorEvent): void {
  console.log("Ошибка", event.message);
}

function onClose(event: WebSocketCloseEvent): void {
  if (event.wasClean) {
    console.log("Соединение закрыто чисто");
  } else {
    console.log("Обрыв соединения");
  }

  console.log(`Код: ${event.code} | Причина: ${event.reason}`, event);
}



