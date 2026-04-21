import { ChatAPI } from "../../api/chat-api";
import { UserAPI } from "../../api/user-api";
import Block, { type BlockOwnProps } from "../../framework/Block";
import Store from "../../store/Store";

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
}

export class ChatsPage extends Block<ChatsPageProps> {
  static componentName = "ChatsPage";
  private chatAPI = new ChatAPI();
  private userAPI = new UserAPI();
  private unsubscribeFromStore: (() => void) | null = null;

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
       <img src="../../../public/Group 194.svg" alt="More" class="messages__more" id='user-bar'>
<div class="user-active" id="user-active">
<p class="user-active__action" id='add-user'>Добавить пользователя</p>
<p class="user-active__action" id='del-user'>Удалить пользователя</p>
</div>

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
  <div class="modal-overlay" id='modal-overlay'>
        {{{AddChatModal}}}
    </div>
      <div class="modal-overlay" id='user-active-modal'>
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
              id="user-search-input"
            />
          </div>
              
        
        <div class="modal__footer">
           <button class="modal__btn modal__btn--primary" id='modal__user-active-btn'>
           {{UserActiveTitle}}
          </button>
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
      safeCurrentChatAvatar: "../../../public/default-avatar.svg",
      safeCurrentChatTitle: "Выберите чат",
      displayMessages: [],
      displayChats: [],
      showAddChatModal: false,
      showAddUserModal: false,
      UserActiveTitle: "",
      showUserActiveModal: false,
    };

    super(initialProps);
  }

  protected events = {
    click: (e: Event) => {
      const target = e.target as HTMLElement;
      const id = target?.id;
      console.log("id", id);

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

        default:
          break;
      }
    },
  };

  private async loadChats(): Promise<void> {
    try {
      console.log("Loading chats...");
      const auth = localStorage.getItem("user");
      // Проверяем, авторизован ли пользователь
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

      // Store.setState("chats", displayChats);

      if (apiChats.length > 0 && !this.props.currentDisplayChat) {
        this.props.currentDisplayChat = displayChats[0];
        this.props.currentChatAvatar =
          apiChats[0].avatar || "../../../public/default-avatar.svg";
        this.props.currentChatTitle = apiChats[0].title;
        this.props.displayMessages = [];

        // Сохраняем выбранный чат в Store
        Store.setState("selectedChatId", apiChats[0].id);

        this.render();

        // Загружаем данные первого чата
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

      // Сохраняем токен в Store
      Store.setState(`chatTokens.${chatId}`, token);

      const users = await this.chatAPI.getChatUsers(chatId);
      console.log("Пользователи чата:", users);

      // Сохраняем пользователей чата в Store
      Store.setState(`chatUsers.${chatId}`, users);
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

      // Сохраняем выбранный чат в Store
      Store.setState("selectedChatId", chatId);

      this.setProps({});
      this.loadChatData(chatId);
    }
  }
  private handleAddChat(): void {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    // Прямая мутация - НЕ используем setProps
    this.props.showAddChatModal = !this.props.showAddChatModal;

    // Вручную обновляем DOM модалки
    const modalElement = document.getElementById("modal-overlay");
    if (modalElement) {
      modalElement.style.display = this.props.showAddChatModal
        ? "flex"
        : "none";
    }
  }

  private handleAddUserModal(): void {
    // Прямая мутация - НЕ используем setProps
    this.props.showAddUserModal = !this.props.showAddUserModal;

    // Вручную обновляем DOM модалки
    const modalElement = document.getElementById("user-active");
    if (modalElement) {
      modalElement.style.display = this.props.showAddUserModal
        ? "flex"
        : "none";
    }
  }

  private handleActiveUser(title: string): void {
    const state = Store.getState();
    const selectedChatId = state.selectedChatId;
    console.log("////////////////////////////", selectedChatId);
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
      "user-search-input",
    ) as HTMLInputElement;
    const login = input?.value.trim();
    const users = (await this.userAPI.searchUsers(login)) as ChatUser[];

    if (this.props.UserActiveTitle == "Удалить") {
      await this.chatAPI.deleteUsersFromChat({
        users: [users[0].id],
        chatId: Number(selectedChatId),
      });
    } else {
      await this.chatAPI.addUsersToChat({
        users: [users[0].id],
        chatId: Number(selectedChatId),
      });
    }
    const modalElement = document.getElementById("user-active-modal");
    if (modalElement) {
      modalElement.style.display = this.props.showAddChatModal
        ? "flex"
        : "none";
    }
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

  protected componentDidMount(): void {
    console.log("ChatsPage mounted");

    // Подписываемся на изменения в Store
    this.unsubscribeFromStore = Store.subscribe(() => {
      console.log("Store changed, reloading chats...");
      this.loadChats();
    });

    // Загружаем чаты при монтировании компонента
    this.loadChats();
  }

  protected componentWillUnmount(): void {
    console.log("ChatsPage unmounting");
    // Отписываемся от Store при размонтировании
    if (this.unsubscribeFromStore) {
      this.unsubscribeFromStore();
      this.unsubscribeFromStore = null;
    }
  }
}
