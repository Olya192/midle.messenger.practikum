interface Contacts {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  status: string;
  lastSeen: null | string;
}

interface Messages {
  id: number;
  senderId: number | string;
  text: string;
  time: string;
  status: string;
  type: string;
};



interface MockData {
  name: string,
    avatar: string,
}

export const mockContacts: Contacts[] = [
  {
    id: 1,
    name: "Анна Смирнова",
    avatar: "https://i.pravatar.cc/150?img=1",
    lastMessage: "Привет! Как дела?",
    lastMessageTime: "10:30",
    unreadCount: 2,
    online: true,
    status: "online",
    lastSeen: null,
  },
  {
    id: 2,
    name: "Михаил Петров",
    avatar: "https://i.pravatar.cc/150?img=2",
    lastMessage: "Созвонимся позже",
    lastMessageTime: "Вчера",
    unreadCount: 0,
    online: false,
    status: "offline",
    lastSeen: "вчера в 20:15",
  },
  {
    id: 3,
    name: "Екатерина Волкова",
    avatar: "https://i.pravatar.cc/150?img=3",
    lastMessage: "Ты отправил документы?",
    lastMessageTime: "Вчера",
    unreadCount: 0,
    online: true,
    status: "online",
    lastSeen: null,
  },
  {
    id: 4,
    name: "Дмитрий Соколов",
    avatar: "https://i.pravatar.cc/150?img=4",
    lastMessage: "Ок, договорились",
    lastMessageTime: "15:45",
    unreadCount: 1,
    online: false,
    status: "offline",
    lastSeen: "был(а) 5 минут назад",
  },
  {
    id: 5,
    name: "Ольга Новикова",
    avatar: "https://i.pravatar.cc/150?img=5",
    lastMessage: "Спасибо за помощь!",
    lastMessageTime: "12:20",
    unreadCount: 0,
    online: false,
    status: "offline",
    lastSeen: "был(а) 2 часа назад",
  },
  {
    id: 6,
    name: "Алексей Иванов",
    avatar: "https://i.pravatar.cc/150?img=6",
    lastMessage: "Когда встреча?",
    lastMessageTime: "09:15",
    unreadCount: 3,
    online: true,
    status: "online",
    lastSeen: null,
  },
  {
    id: 7,
    name: "Мария Кузнецова",
    avatar: "https://i.pravatar.cc/150?img=7",
    lastMessage: "Фото с вчерашнего 📸",
    lastMessageTime: "11:05",
    unreadCount: 0,
    online: true,
    status: "online",
    lastSeen: null,
  },
  {
    id: 8,
    name: "Павел Морозов",
    avatar: "https://i.pravatar.cc/150?img=8",
    lastMessage: "Скинь номер договора",
    lastMessageTime: "Чт",
    unreadCount: 0,
    online: false,
    status: "offline",
    lastSeen: "был(а) вчера",
  },
  {
    id: 9,
    name: "Наталья Волкова",
    avatar: "https://i.pravatar.cc/150?img=9",
    lastMessage: "🎉🎉🎉",
    lastMessageTime: "Ср",
    unreadCount: 0,
    online: false,
    status: "offline",
    lastSeen: "был(а) 3 дня назад",
  },
  {
    id: 10,
    name: "Игорь Сидоров",
    avatar: "https://i.pravatar.cc/150?img=10",
    lastMessage: "Го в CS:GO?",
    lastMessageTime: "08:20",
    unreadCount: 5,
    online: true,
    status: "online",
    lastSeen: null,
  },
];

export const mockMessages: Messages[] =  [
    // Чат с Анной
    {
      id: 101,
      senderId: 1,
      text: "Привет! Как дела?",
      time: "10:30",
      status: "read",
      type: "received",
    },
    {
      id: 102,
      senderId: "me",
      text: "Привет! Всё отлично, работаю над проектом. А у тебя?",
      time: "10:32",
      status: "read",
      type: "sent",
    },
    {
      id: 103,
      senderId: 1,
      text: "Тоже норм 😊 Что делаешь сегодня вечером?",
      time: "10:33",
      status: "read",
      type: "received",
    },
    {
      id: 104,
      senderId: 1,
      text: "Может, встретимся?",
      time: "10:33",
      status: "read",
      type: "received",
    },
    {
      id: 105,
      senderId: "me",
      text: "Давай! Во сколько и где?",
      time: "10:35",
      status: "delivered",
      type: "sent",
    },
  ]


export const mockData:MockData = {
  name: "Анна Смирнова",
  avatar: "https://i.pravatar.cc/150?img=1",
};
