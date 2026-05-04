import { ChatAPI } from "../../api/chat-api";
import { UserAPI } from "../../api/user-api";
import Block, { type BlockOwnProps } from "../../framework/Block";
import Store from "../../store/Store";
import { getRouter } from "../../utils/navigation";
import { connect, getMessages, sendMessage } from "../../api/chat-websockets";
import { AuthAPI } from "../../api/auth-api";
import defaultAvatar from "../../assets/images/default-avatar.svg";
import group194 from "../../assets/images/Group 194.svg";
import group196 from "../../assets/images/Group 196.svg";
import group202 from "../../assets/images/Group 202.svg";

// Функция для экранирования HTML
function escapeHtml(str: string): string {
  if (!str) return '';
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return str.replace(/[&<>"'/`=]/g, (char) => htmlEscapes[char]);
}

interface ApiChatUser {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
}

interface Messages {
  user_id: number;
  content: string;
  time: string;
  id: number;
  type: string;
  date: string;
}

interface GroupedMessage {
  date: string;
  messages: Messages[];
}

interface ApiLastMessage {
  user: ApiChatUser;
  time: string;
  content: string;
}

interface ApiChat {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  created_by: number;
  last_message: ApiLastMessage | null;
}

interface ChatUser {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
}

interface ChatLastMessage {
  user: ChatUser;
  time: string;
  content: string;
}

interface ChatData {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  created_by: number;
  last_message: ChatLastMessage | null;
}

export interface IMessage {
  user_id: number;
  content: string;
  time: string;
  id: number;
  type: string;
  date: string;
}

interface DisplayChat extends ChatData {
  lastMessageContent: string;
  lastMessageTime: string;
}

interface SafeChat {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  created_by: number;
  last_message: ChatLastMessage | null;
}

interface SafeMessage {
  id: number;
  senderId: number;
  text: string;
  time: string;
  chatId: number;
  type: string;
}

interface DisplayMessage {
  id: number;
  senderId: number;
  text: string;
  time: string;
  chatId: number;
  type: string;
}

export type MessagesWS = {
  chat_id: number;
  time: string;
  type: string;
  user_id: string;
  content: string;
  file?: {
    id: number;
    user_id: number;
    path: string;
    filename: string;
    content_type: string;
    content_size: number;
    upload_date: string;
  };
};

interface ChatsPageProps extends BlockOwnProps {
  showAddChatModal?: boolean;
  onAddChat?: () => void;
  onCloseModal?: () => void;
  onChatCreated?: () => void;
  displayMessages?: DisplayMessage[];
  displayChats?: DisplayChat[];
  safeChats?: SafeChat[];
  safeMessages?: SafeMessage[];
  safeSelectedChat?: SafeChat;
  safeCurrentChatAvatar?: string;
  safeCurrentChatTitle?: string;
  currentDisplayChat?: DisplayChat;
  showAddUserModal: boolean;
  UserActiveTitle: string;
  showUserActiveModal: boolean;
  group194Icon?: string;
  group196Icon?: string;
  group202Icon?: string;
  chatMessages: GroupedMessage[];
  userOwnID: number;
  error?: string;
}

export class ChatsPage extends Block<ChatsPageProps> {
  static componentName = "ChatsPage";
  private chatAPI = new ChatAPI();
  private userAPI = new UserAPI();
  private unsubscribeFromStore: (() => void) | null = null;
  private isRendering = false;

  // Проверка на XSS паттерны
  private containsXSSPattern(value: string): boolean {
    if (!value) return false;
    
    const xssPatterns = [
      /<script\b/i,
      /javascript:/i,
      /onerror\s*=/i,
      /onload\s*=/i,
      /onclick\s*=/i,
      /<iframe\b/i,
      /<object\b/i,
      /<embed\b/i,
      /<link\b/i,
      /expression\s*\(/i,
      /url\s*\(/i,
      /<img[^>]+src\s*=\s*["'][^"']*["']/i
    ];
    
    return xssPatterns.some(pattern => pattern.test(value));
  }

  // Санитизация сообщения перед отправкой
  private sanitizeMessageContent(content: string): string {
    if (!content) return '';
    
    // Удаляем опасные HTML теги
    let sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<img[^>]+>/gi, '');
    
    // Ограничиваем длину сообщения
    if (sanitized.length > 5000) {
      sanitized = sanitized.substring(0, 5000);
    }
    
    // Экранируем HTML символы
    return escapeHtml(sanitized);
  }

  // Санитизация названия чата
  private sanitizeChatTitle(title: string): string {
    if (!title) return 'Чат';
    let sanitized = title.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s_-]/g, '');
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100);
    }
    return escapeHtml(sanitized);
  }

  // Санитизация логина пользователя
  private sanitizeLogin(login: string): string {
    if (!login) return '';
    return login.replace(/[^a-zA-Z0-9_-]/g, '');
  }

  private cleanData<T>(data: T): T {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.error("Ошибка при очистке данных:", error);
      return data;
    }
  }

  private sanitizeChat(chat: DisplayChat | undefined): SafeChat | undefined {
    if (!chat) return undefined;

    const cleanChat = this.cleanData(chat);
    const lastMessage = cleanChat.last_message;
    let safeLastMessage: ApiLastMessage | null = null;

    if (lastMessage) {
      safeLastMessage = {
        user: {
          id: lastMessage.user.id || 0,
          first_name: escapeHtml(lastMessage.user.first_name || ""),
          second_name: escapeHtml(lastMessage.user.second_name || ""),
          display_name: escapeHtml(
            lastMessage.user.display_name ||
            `${lastMessage.user.first_name} ${lastMessage.user.second_name}`.trim() ||
            "Пользователь"
          ),
          login: escapeHtml(lastMessage.user.login || ""),
          email: escapeHtml(lastMessage.user.email || ""),
          phone: escapeHtml(lastMessage.user.phone || ""),
          avatar: lastMessage.user.avatar || "",
          role: escapeHtml(lastMessage.user.role || "user"),
        },
        time: escapeHtml(lastMessage.time),
        content: escapeHtml(lastMessage.content),
      };
    }

    return {
      id: cleanChat.id,
      title: this.sanitizeChatTitle(cleanChat.title),
      avatar: cleanChat.avatar,
      unread_count: cleanChat.unread_count,
      created_by: cleanChat.created_by,
      last_message: safeLastMessage,
    };
  }

  private sanitizeChats(chats: DisplayChat[]): SafeChat[] {
    const cleanChats = this.cleanData(chats);
    return cleanChats
      .map((chat) => this.sanitizeChat(chat))
      .filter((chat): chat is SafeChat => chat !== undefined);
  }

  private sanitizeMessages(messages: DisplayMessage[]): SafeMessage[] {
    const cleanMessages = this.cleanData(messages);
    return cleanMessages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      text: escapeHtml(msg.text),
      time: escapeHtml(msg.time),
      chatId: msg.chatId,
      type: escapeHtml(msg.type),
    }));
  }

  private formatTime(timeString: string): string {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private formatDateMonth(dateString: string): string {
    if (!dateString) return "";

    const date = new Date(dateString);
    const day = date.getDate();

    const months: { [key: number]: string } = {
      0: "января",
      1: "февраля",
      2: "марта",
      3: "апреля",
      4: "мая",
      5: "июня",
      6: "июля",
      7: "августа",
      8: "сентября",
      9: "октября",
      10: "ноября",
      11: "декабря",
    };

    const monthName = months[date.getMonth()];
    return `${day} ${monthName}`;
  }

  private isApiChat(chat: unknown): chat is ApiChat {
    return (
      typeof chat === "object" &&
      chat !== null &&
      "id" in chat &&
      "title" in chat &&
      "unread_count" in chat &&
      "created_by" in chat &&
      "last_message" in chat
    );
  }

  private convertToDisplayChat(chat: ApiChat): DisplayChat {
    const sanitizedTitle = this.sanitizeChatTitle(chat.title);
    const lastMessageContent = chat.last_message?.content 
      ? escapeHtml(chat.last_message.content) 
      : "Нет сообщений";
    
    return {
      id: chat.id,
      title: sanitizedTitle,
      avatar: chat.avatar
        ? `https://ya-praktikum.tech/api/v2/resources${chat.avatar}`
        : defaultAvatar,
      unread_count: chat.unread_count,
      created_by: chat.created_by,
      last_message: chat.last_message,
      lastMessageContent: lastMessageContent,
      lastMessageTime: chat.last_message
        ? this.formatTime(chat.last_message.time)
        : "",
    };
  }

  private createTemplateData(): void {
    this.props.safeChats = this.cleanData(
      this.sanitizeChats(this.props.displayChats || []),
    );
    this.props.safeMessages = this.cleanData(
      this.sanitizeMessages(this.props.displayMessages || []),
    );

    if (this.props.currentDisplayChat) {
      this.props.safeSelectedChat = this.cleanData(
        this.sanitizeChat(this.props.currentDisplayChat),
      );
    } else {
      this.props.safeSelectedChat = undefined;
    }

    this.props.safeCurrentChatAvatar =
      this.props.currentChatAvatar || defaultAvatar;
    this.props.safeCurrentChatTitle = this.props.currentChatTitle 
      ? this.sanitizeChatTitle(this.props.currentChatTitle)
      : "Выберите чат";
  }

  protected render(): void {
    console.log("chats render");

    if (this.isRendering) {
      return;
    }

    this.isRendering = true;

    try {
      console.log("chats render ok");
      this.createTemplateData();
      super.render();
    } finally {
      this.isRendering = false;
    }
  }

  protected template = `<main class="messenger">
   <div class="chats">
    <form class="chats__header">
      <p class="chats__add-btn" id='btn-add-chat'>добавить чат + </p>
      <p id='btn-profile'>Профиль &gt;</p>
      <input type="text" placeholder="Поиск"/>
    </form>
    <section class="chats__cards">
        {{#each safeChats}}
          <div class="chat-card" data-chat-id="{{id}}">
            <img src="{{avatar}}" alt="{{title}}" class="chat-avatar">
            <div class="chat-info">
              <p class="chat-name">{{title}}</p>
              <p class="chat-last-message">{{lastMessageContent}}</p>
            </div>
            <div class="chat-meta">
              <span class="chat-time">{{lastMessageTime}}</span>
              {{#if unread_count}}
                <span class="chat-unread">{{unread_count}}</span>
              {{/if}}
            </div>
          </div>
        {{/each}}
    </section>
  </div>
  <div class="messages">
    <div class="messages__header">
       <img src="{{safeCurrentChatAvatar}}" alt="Avatar" class="messages__avatar">
       <p>{{safeCurrentChatTitle}}</p>
       <img src="{{group194Icon}}" alt="More" class="messages__more" id='user-bar'>
<div class="user-active" id="user-active">
<p class="user-active__action" id='add-user'>Добавить пользователя</p>
<p class="user-active__action" id='del-user'>Удалить пользователя</p>
</div>

    </div>
    <div class="messages__cards-wrapper">
    <div class="messages__cards">
    {{#each chatMessages}}
        <div class="messages__date-separator">
            <div class="separator-line"></div>
            <span class="separator-date">{{date}}</span>
            <div class="separator-line"></div>
        </div>
        {{#each messages}}
            <div class="messages__card{{#if (eq user_id  @root.userOwnID)}}--me{{/if}}">
                <p class="message__text">{{content}}</p>
                <span class="message__time">{{time}}</span>
            </div>
        {{/each}}
    {{/each}}
</div>
     </div>
    {{#if safeSelectedChat}}
    <form class="messages__write">
      <input type="file" id="file-box" class="messages__file-box">
      <label for="file-box" class="messages__file-label">
        <img src="{{group196Icon}}" alt="Загрузить файл">
      </label>
      <div class="messages__form">
        <input type="text" placeholder="Сообщение" class="messages__box" id='messages-text'>
        <button class="messages__button" type="submit">
          <img src="{{group202Icon}}" class="messages__enter" alt="Отправить" id='messages-send'>
        </button>    
      </div>  
    </form>
    {{/if}}
  </div>
  <div class="modal-overlay1" id='modal-overlay'>
       <div class="modal">
        <div class="modal__header">
          <h2>Создать новый чат</h2>
        </div>        
        <div class="modal__body">
          <div class="modal__search">
            <input 
              type="text" 
              placeholder="Введите логин пользователя" 
              class="modal__input"
              id="user-search-input"
            />
          </div>            
        <div class="modal__footer">
           <button class="modal__btn modal__btn--primary" id='modal__search-btn'>
            Создать чат
          </button>
        </div>
      </div>
    </div>
       </div>
      <div class="modal-overlay2" id='user-active-modal'>
        <div class="modal">
        <div class="modal__header">
          <h2>{{UserActiveTitle}} пользователя</h2>
        </div>        
        <div class="modal__body">
          <div class="modal__search">
            <input 
              type="text" 
              placeholder="Введите логин пользователя" 
              class="modal__input"
              id="user-search-input-chat"
            />
          </div>        
        <div class="modal__footer">
           <button class="modal__btn modal__btn--primary" id='modal__user-active-btn'>
           {{UserActiveTitle}}
          </button>
        </div>
      </div>
    </div>
    </div>
</main>`;

  constructor(props: ChatsPageProps = {} as ChatsPageProps) {
    const initialProps: ChatsPageProps = {
      ...props,
      safeChats: [],
      safeMessages: [],
      safeSelectedChat: undefined,
      safeCurrentChatAvatar: defaultAvatar,
      safeCurrentChatTitle: "Выберите чат",
      displayMessages: [],
      displayChats: [],
      showAddChatModal: false,
      showAddUserModal: false,
      UserActiveTitle: "",
      showUserActiveModal: false,
      group194Icon: group194,
      group196Icon: group196,
      group202Icon: group202,
      chatMessages: [],
      userOwnID: 0,
    };
    super(initialProps);
    this.saveData = this.saveData.bind(this);
  }

  protected events = {
    click: (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      const target = e.target as HTMLElement;
      const id = target?.id;
      console.log("id", id);
      const router = getRouter();

      const chatCard = target.closest(".chat-card");
      if (chatCard) {
        const chatId = chatCard.getAttribute("data-chat-id");
        if (chatId) {
          this.handleChatSelect(Number(chatId));
        }
        return;
      }

      switch (id) {
        case "btn-add-chat":
        case "modal-overlay":
          this.handleAddChat();
          break;
        case "user-bar":
          this.handleAddUserModal();
          break;
        case "add-user":
          this.handleActiveUser("Добавить");
          break;
        case "del-user":
          this.handleActiveUser("Удалить");
          break;
        case "user-active-modal":
          this.handleActiveUser("");
          break;
        case "modal__user-active-btn":
          this.handleUserActionButton();
          break;
        case "btn-profile":
          router.go("/settings");
          break;
        case "modal__search-btn":
          this.handleSearch();
          break;
        case "messages-send":
          this.sendMessages();
          break;
        default:
          break;
      }
    },
  };

  private async loadChats(): Promise<void> {
    try {
      console.log("Loading chats...");
      const auth = localStorage.getItem("user");
      
      if (!auth) {
        console.log("User not authenticated, skipping chats load");
        return;
      }

      const rawChats = await this.chatAPI.getChats({ offset: 0, limit: 100 });
      console.log("Список чатов загружен:", rawChats);

      const cleanRawChats = this.cleanData(rawChats);
      const apiChats: ApiChat[] = cleanRawChats.filter(this.isApiChat);

      const displayChats: DisplayChat[] = apiChats.map((chat) =>
        this.convertToDisplayChat(chat),
      );

      this.props.displayChats = displayChats;
      this.setProps({ displayChats });

      if (apiChats.length > 0 && !this.props.currentDisplayChat) {
        this.props.currentDisplayChat = displayChats[0];
        this.props.currentChatAvatar =
          apiChats[0].avatar || "../../../public/default-avatar.svg";
        this.props.currentChatTitle = this.sanitizeChatTitle(apiChats[0].title);
        this.props.displayMessages = [];

        Store.setState("selectedChatId", apiChats[0].id);
        await this.loadChatData(apiChats[0].id);
      } else {
        this.setProps({});
      }
    } catch (error) {
      console.error("Ошибка при загрузке чатов:", error);
    }
  }

  private async loadChatData(chatId: number): Promise<void> {
    try {
      const { token } = await this.chatAPI.getChatToken(chatId);
      console.log("Токен для WebSocket получен:", token);

      Store.setState(`chatTokens.${chatId}`, token);

      const users = await this.chatAPI.getChatUsers(chatId);
      console.log("Пользователи чата:", users);

      const authAPI = new AuthAPI();
      const userData = await authAPI.getUser();

      connect({ chatId, userId: userData?.id, token, saveData: this.saveData });
      getMessages();

      Store.setState(`chatUsers.${chatId}`, users);
    } catch (error) {
      console.error("Ошибка при загрузке данных чата:", error);
    }
    this.render();
  }

  public saveData(data: string) {
    const parsedData = JSON.parse(data);

    if (parsedData?.id) {
      getMessages();
      return;
    }

    const sortedMessages = [...parsedData].sort((a, b) => {
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    });

    const formattedMessages: IMessage[] = sortedMessages.map((msg) => ({
      user_id: msg.user_id,
      content: escapeHtml(msg.content), // Экранируем содержимое сообщения
      time: this.formatTime(msg.time),
      id: msg.id,
      type: escapeHtml(msg.type),
      date: this.formatDateMonth(msg.time),
    }));

    const groupedMessages = this.groupMessagesByDate(formattedMessages);

    const authAPI = new AuthAPI();
    authAPI.getUser().then((userData: { id: number }) => {
      this.setProps({
        chatMessages: groupedMessages,
        userOwnID: Number(userData.id),
      });
      console.log('groupedMessages', groupedMessages);
    });
  }

  private groupMessagesByDate(messages: Messages[]): GroupedMessage[] {
    const groups: GroupedMessage[] = [];
    let currentDate: string | null = null;
    let currentGroup: GroupedMessage | null = null;

    messages.forEach((message: Messages) => {
      if (message.date !== currentDate) {
        currentDate = message.date;
        currentGroup = {
          date: escapeHtml(currentDate),
          messages: [],
        };
        groups.push(currentGroup);
      }
      if (currentGroup) {
        currentGroup.messages.push({
          ...message,
          content: escapeHtml(message.content),
        });
      }
    });

    return groups;
  }

  private sendMessages(): void {
    const input = document.getElementById("messages-text") as HTMLInputElement;
    let content = input?.value.trim();
    
    if (!content) return;
    
    // Санитизация сообщения перед отправкой
    content = this.sanitizeMessageContent(content);
    
    if (content) {
      sendMessage(content);
      input.value = "";
    }
  }

  private handleChatSelect(chatId: number): void {
    const chats = this.props.displayChats;
    if (!chats) return;

    const selectedChat = chats.find((chat: DisplayChat) => chat.id === chatId);

    if (selectedChat) {
      this.props.currentDisplayChat = selectedChat;
      this.props.currentChatAvatar = selectedChat.avatar || defaultAvatar;
      this.props.currentChatTitle = this.sanitizeChatTitle(selectedChat.title);
      this.props.displayMessages = [];

      Store.setState("selectedChatId", chatId);
      this.loadChatData(chatId);
    }
    this.render();
  }

  private handleAddChat(): void {
    this.props.showAddChatModal = !this.props.showAddChatModal;

    const modalElement = document.getElementById("modal-overlay");
    if (modalElement) {
      modalElement.style.display = this.props.showAddChatModal
        ? "flex"
        : "none";
    }
  }

  private handleAddUserModal(): void {
    this.props.showAddUserModal = !this.props.showAddUserModal;

    const modalElement = document.getElementById("user-active");
    if (modalElement) {
      modalElement.style.display = this.props.showAddUserModal
        ? "flex"
        : "none";
    }
  }

  private handleActiveUser(title: string): void {
    this.props.UserActiveTitle = title;
    this.render();
    this.props.showUserActiveModal = !this.props.showUserActiveModal;

    const modalElement = document.getElementById("user-active-modal");
    if (modalElement) {
      modalElement.style.display = this.props.showUserActiveModal
        ? "flex"
        : "none";
    }

    this.handleAddUserModal();
  }

  private async handleUserActionButton(): Promise<void> {
    const state = Store.getState();
    const selectedChatId = state.selectedChatId;
    const input = document.getElementById(
      "user-search-input-chat",
    ) as HTMLInputElement;
    let login = input?.value.trim();
    
    // Санитизация логина
    login = this.sanitizeLogin(login);
    
    if (!login) {
      this.showErrorMessage("Введите логин пользователя");
      return;
    }
    
    try {
      const users = (await this.userAPI.searchUsers(login)) as ChatUser[];
      console.log("handleSearch users", users);

      if (users.length === 0) {
        this.showErrorMessage("Пользователи не найдены");
        return;
      }

      if (this.props.UserActiveTitle == "Удалить") {
        const usersChat = await this.chatAPI.getChatUsers(Number(selectedChatId));
        console.log("usersChat", usersChat);
        
        if (usersChat.length === 1) {
          await this.chatAPI.deleteChat({ chatId: Number(selectedChatId) });
        } else {
          await this.chatAPI.deleteUsersFromChat({
            users: [users[0].id],
            chatId: Number(selectedChatId),
          });
        }
      } else {
        await this.chatAPI.addUsersToChat({
          users: [users[0].id],
          chatId: Number(selectedChatId),
        });
        const usersChat = await this.chatAPI.getChatUsers(Number(selectedChatId));
        console.log("usersChat", usersChat);
      }

      const modalElement = document.getElementById("user-active-modal");
      if (modalElement) {
        modalElement.style.display = this.props.showAddChatModal
          ? "flex"
          : "none";
      }

      const rawChats = await this.chatAPI.getChats({ offset: 0, limit: 100 });
      const cleanRawChats = this.cleanData(rawChats);
      const apiChats: ApiChat[] = cleanRawChats.filter(this.isApiChat);
      const displayChats: DisplayChat[] = apiChats.map((chat) =>
        this.convertToDisplayChat(chat),
      );

      this.props.displayChats = displayChats;
      this.render();
    } catch (error) {
      console.error("Ошибка:", error);
      this.showErrorMessage("Произошла ошибка, попробуйте позже");
    }
  }

  private showErrorMessage(message: string): void {
    const messagesContainer = this.element()?.querySelector(".messages__cards");
    if (messagesContainer) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = message;
      errorDiv.style.color = "red";
      errorDiv.style.padding = "10px";
      errorDiv.style.textAlign = "center";
      messagesContainer.prepend(errorDiv);
      
      setTimeout(() => {
        errorDiv.remove();
      }, 3000);
    }
  }

  protected componentDidMount(): void {
    this.unsubscribeFromStore = Store.subscribe(() => {
      this.loadChats();
    });
    this.loadChats();
  }

  protected componentWillUnmount(): void {
    console.log("ChatsPage unmounting");
    if (this.unsubscribeFromStore) {
      this.unsubscribeFromStore();
      this.unsubscribeFromStore = null;
    }
  }

  private async handleSearch(): Promise<void> {
    const input = document.getElementById(
      "user-search-input",
    ) as HTMLInputElement;

    let login = input?.value.trim();
    console.log("handleSearch login", login);
    
    if (!login) {
      this.showErrorMessage("Введите логин пользователя");
      return;
    }

    // Санитизация логина
    login = this.sanitizeLogin(login);

    try {
      const users = (await this.userAPI.searchUsers(login)) as ChatUser[];
      console.log("handleSearch users", users);

      if (users.length === 0) {
        this.showErrorMessage("Пользователи не найдены");
        return;
      }

      const createChatResponse = await this.chatAPI.createChat({
        title: this.sanitizeChatTitle(users[0].login),
      });

      await this.chatAPI.addUsersToChat({
        users: [users[0].id],
        chatId: createChatResponse.id,
      });

      const rawChats = await this.chatAPI.getChats({ offset: 0, limit: 100 });
      console.log("Список чатов загружен:", rawChats);

      const cleanRawChats = this.cleanData(rawChats);
      const apiChats: ApiChat[] = cleanRawChats.filter(this.isApiChat);

      const displayChats: DisplayChat[] = apiChats.map((chat) =>
        this.convertToDisplayChat(chat),
      );

      this.props.displayChats = displayChats;

      if (displayChats.length > 0 && !this.props.currentDisplayChat) {
        this.props.currentDisplayChat = displayChats[0];
        this.props.currentChatAvatar =
          displayChats[0].avatar || "../../../public/default-avatar.svg";
        this.props.currentChatTitle = this.sanitizeChatTitle(displayChats[0].title);
        this.props.displayMessages = [];
        Store.setState("selectedChatId", displayChats[0].id);
        await this.loadChatData(displayChats[0].id);
      }

      this.render();
      
      // Закрываем модальное окно
      const modalElement = document.getElementById("modal-overlay");
      if (modalElement) {
        modalElement.style.display = "none";
        this.props.showAddChatModal = false;
      }
    } catch (error) {
      console.error("Ошибка при поиске пользователей:", error);
      this.showErrorMessage("Ошибка при создании чата");
    }
  }
}
