import { ChatAPI } from "../../api/chat-api";
import Block, { type BlockOwnProps } from "../../framework/Block";

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

interface ChatsPageProps extends BlockOwnProps {
  showAddChatModal?: boolean;
  onAddChat?: () => void;
  onCloseModal?: () => void;
  onChatCreated?: () => void;
  attachEvents?: (data: any) => void;
  displayMessages?: DisplayMessage[];
  displayChats?: DisplayChat[];
  safeChats?: SafeChat[];
  safeMessages?: SafeMessage[];
  safeSelectedChat?: SafeChat;
  safeCurrentChatAvatar?: string;
  safeCurrentChatTitle?: string;
  currentDisplayChat?: DisplayChat;
}

export class ChatsPage extends Block<ChatsPageProps> {
  static componentName = "ChatsPage";
  private chatAPI = new ChatAPI();

  // Добавляем флаг для предотвращения множественных рендеров
  private isRendering = false;

  private cleanData<T>(data: T): T {
    try {
      // Используем JSON для удаления всех циклических ссылок
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.error("Ошибка при очистке данных:", error);
      return data;
    }
  }

  private sanitizeChat(chat: DisplayChat | undefined): SafeChat | undefined {
    if (!chat) return undefined;

    // Создаем новый объект без ссылок на оригинал
    const cleanChat = this.cleanData(chat);

    const lastMessage = cleanChat.last_message;
    let safeLastMessage: ApiLastMessage | null = null;

    if (lastMessage) {
      safeLastMessage = {
        user: {
          id: lastMessage.user.id || 0,
          first_name: lastMessage.user.first_name || "",
          second_name: lastMessage.user.second_name || "",
          display_name:
            lastMessage.user.display_name ||
            `${lastMessage.user.first_name} ${lastMessage.user.second_name}`.trim() ||
            "Пользователь",
          login: lastMessage.user.login || "",
          email: lastMessage.user.email || "",
          phone: lastMessage.user.phone || "",
          avatar: lastMessage.user.avatar || "",
          role: lastMessage.user.role || "user",
        },
        time: lastMessage.time,
        content: lastMessage.content,
      };
    }

    // Возвращаем полностью новый объект
    return {
      id: cleanChat.id,
      title: cleanChat.title,
      avatar: cleanChat.avatar,
      unread_count: cleanChat.unread_count,
      created_by: cleanChat.created_by,
      last_message: safeLastMessage,
    };
  }

  private sanitizeChats(chats: DisplayChat[]): SafeChat[] {
    // Очищаем весь массив от циклических ссылок
    const cleanChats = this.cleanData(chats);
    return cleanChats
      .map((chat) => this.sanitizeChat(chat))
      .filter((chat): chat is SafeChat => chat !== undefined);
  }

  private sanitizeMessages(messages: DisplayMessage[]): SafeMessage[] {
    // Очищаем сообщения от циклических ссылок
    const cleanMessages = this.cleanData(messages);
    return cleanMessages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      text: msg.text,
      time: msg.time,
      chatId: msg.chatId,
      type: msg.type,
    }));
  }

  private createTemplateData(): void {
    // Очищаем все данные перед рендерингом
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
      this.props.currentChatAvatar || "../../../public/default-avatar.svg";
    this.props.safeCurrentChatTitle =
      this.props.currentChatTitle || "Выберите чат";
  }

  // Переопределяем render для очистки данных перед рендерингом
  protected render(): void {
    // Предотвращаем рекурсивные вызовы
    if (this.isRendering) {
      return;
    }

    this.isRendering = true;

    try {
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
      <a href='/settings'>Профиль &gt;</a>
      <input type="text" placeholder="Поиск"/>
    </form>
    <section class="chats__cards">
        {{#each safeChats}}
          <div class="chat-card" data-chat-id="{{id}}" onclick={{../onChatClick}}>
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
       <img src="../../../public/Group 194.svg" alt="More" class="messages__more">
    </div>
    <section class="messages__cards">
        {{#each safeMessages}}
          <div class="message {{#if isOwn}}message--own{{/if}}">
            <p class="message__text">{{text}}</p>
            <span class="message__time">{{time}}</span>
          </div>
        {{/each}}
    </section>
    {{#if safeSelectedChat}}
    <form class="messages__write">
      <input type="file" id="file-box" class="messages__file-box">
      <label for="file-box" class="messages__file-label">
        <img src="../../../public/Group 196.svg" alt="Загрузить файл">
      </label>
      <div class="messages__form">
        <input type="text" placeholder="Сообщение" class="messages__box">
        <button class="messages__button" type="submit">
          <img src="../../../public/Group 202.svg" class="messages__enter" alt="Отправить">
        </button>    
      </div>  
    </form>
    {{/if}}
  </div>
  
  {{#if showAddChatModal}}
    <div class="modal-overlay" onclick={{onCloseModal}}>
      <div class="modal" onclick="event.stopPropagation()">
        {{{AddChatModal 
          onClose=onCloseModal 
          onChatCreated=onChatCreated
        }}}
      </div>
    </div>
  {{/if}}
</main>`;

  constructor(props: ChatsPageProps = {} as ChatsPageProps) {
    // Привязываем методы к экземпляру
    const handleAddChat = () => this.handleAddChat();
    const handleCloseModal = () => this.handleCloseModal();
    const handleChatCreated = () => this.handleChatCreated();
    const handleChatClick = (chatId: number) => this.handleChatSelect(chatId);
    const attachEvents = (fragment: any) => this.attachEvents(fragment);

    const initialProps: ChatsPageProps = {
      ...props,
      safeChats: [],
      safeMessages: [],
      safeSelectedChat: undefined,
      safeCurrentChatAvatar: "../../../public/default-avatar.svg",
      safeCurrentChatTitle: "Выберите чат",
      displayMessages: [],
      displayChats: [],
      showAddChatModal: false,
      // Передаем привязанные функции
      onAddChat: handleAddChat,
      onCloseModal: handleCloseModal,
      onChatCreated: handleChatCreated,
      onChatClick: handleChatClick,
      attachEvents: attachEvents,
    };

    super(initialProps);
  }

  private attachEvents(fragment: any): void {
    const btn = fragment.getElementById("btn-add-chat");
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!", btn);
    btn?.addEventListener("click", () => {
      this.handleAddChat();
    });
  }

  private async loadChats(): Promise<void> {
    try {
      const rawChats = await this.chatAPI.getChats({ offset: 0, limit: 100 });
      console.log("Список чатов загружен:", rawChats);

      // Очищаем данные сразу после получения
      const cleanRawChats = this.cleanData(rawChats);

      const apiChats: ApiChat[] = cleanRawChats.filter(this.isApiChat);

      const displayChats: DisplayChat[] = apiChats.map((chat) =>
        this.convertToDisplayChat(chat),
      );

      this.props.displayChats = displayChats;
      this.props.currentDisplayChat =
        apiChats.length > 0 ? displayChats[0] : undefined;
      this.props.currentChatAvatar =
        apiChats.length > 0
          ? apiChats[0].avatar || "../../../public/default-avatar.svg"
          : "../../../public/default-avatar.svg";
      this.props.currentChatTitle =
        apiChats.length > 0 ? apiChats[0].title : "Выберите чат";
      this.props.displayMessages = [];

      // Используем setProps вместо прямого рендера
      this.setProps({});

      if (apiChats.length > 0) {
        await this.loadChatData(apiChats[0].id);
      }
    } catch (error) {
      console.error("Ошибка при загрузке чатов:", error);
    }
  }

  private async loadChatData(chatId: number): Promise<void> {
    try {
      const { token } = await this.chatAPI.getChatToken(chatId);
      console.log("Токен для WebSocket получен:", token);

      const users = await this.chatAPI.getChatUsers(chatId);
      console.log("Пользователи чата:", users);
    } catch (error) {
      console.error("Ошибка при загрузке данных чата:", error);
    }
  }

  private handleChatSelect(chatId: number): void {
    const chats = this.props.displayChats;
    if (!chats) return;

    const selectedChat = chats.find((chat: DisplayChat) => chat.id === chatId);

    if (selectedChat) {
      this.props.currentDisplayChat = selectedChat;
      this.props.currentChatAvatar =
        selectedChat.avatar || "../../../public/default-avatar.svg";
      this.props.currentChatTitle = selectedChat.title;
      this.props.displayMessages = [];

      this.setProps({});
      this.loadChatData(chatId);
    }
  }

  private handleAddChat(): void {
    console.log("все в пизду!");
    this.props.showAddChatModal = !this.props.showAddChatModal;
    this.setProps({});
  }

  private handleCloseModal(): void {
    this.props.showAddChatModal = false;
    this.setProps({});
  }

  private async handleChatCreated(): Promise<void> {
    this.props.showAddChatModal = false;
    this.setProps({});
    await this.loadChats();
  }

  private formatTime(timeString: string): string {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
    return {
      id: chat.id,
      title: chat.title,
      avatar: chat.avatar || "../../../public/default-avatar.svg",
      unread_count: chat.unread_count,
      created_by: chat.created_by,
      last_message: chat.last_message,
      lastMessageContent: chat.last_message?.content || "Нет сообщений",
      lastMessageTime: chat.last_message
        ? this.formatTime(chat.last_message.time)
        : "",
    };
  }
}
