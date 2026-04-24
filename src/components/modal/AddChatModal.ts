import { ChatAPI } from "../../api/chat-api";
import { UserAPI } from "../../api/user-api";
import type { BlockOwnProps } from "../../framework/Block";
import Block from "../../framework/Block";
import Store from "../../store/Store";

// Используем правильный тип пользователя
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

interface SearchResultUser extends ChatUser {
  selected: boolean;
}

interface AddChatModalProps extends BlockOwnProps {
  onClose?: () => void;
  onChatCreated?: () => void;
  searchResults?: SearchResultUser[];
  canCreate?: boolean;
  selectedUserId?: number;
}

export class AddChatModal extends Block<AddChatModalProps> {
  static componentName = "AddChatModal";

  private userAPI = new UserAPI();
  private chatAPI = new ChatAPI();

  protected template = `
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
           <button class="modal__btn modal__btn--primary" data-action='modal__search-btn'>
            Создать чат
          </button>
        </div>
      </div>
  `;

  constructor(props: AddChatModalProps = {} as AddChatModalProps) {
    super({
      ...props,
      searchResults: props.searchResults ?? [],
      error: props.error ?? "",
      canCreate: props.canCreate ?? false,
      selectedUserId: props.selectedUserId ?? undefined,
    } as AddChatModalProps);
  }

  protected events = {
    click: (e: Event) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      const action = target.getAttribute("data-action");
      console.log("action", action);

      switch (action) {
        case "modal__search-btn":
          this.handleSearch();
          break;

        default:
          break;
      }
    },
  };

  private async handleSearch(): Promise<void> {
    const input = document.getElementById(
      "user-search-input",
    ) as HTMLInputElement;
    console.log("handleSearch input", input);
    const login = input?.value.trim();
    console.log("handleSearch login", login);
    if (!login) {
      this.props.error = "Введите логин пользователя";

      this.render();
      return;
    }

    try {
      this.props.error = "";
      this.props.searchResults = [];

      this.render();

      const users = (await this.userAPI.searchUsers(login)) as ChatUser[];
      console.log("handleSearch users", users);

      if (users.length === 0) {
        this.props.error = "Пользователи не найдены";
        this.props.searchResults = [];
        this.props.canCreate = false;
        this.render();
        return;
      }

      const createChatResponse = await this.chatAPI.createChat({
        title: users[0].login,
      });

      await this.chatAPI.addUsersToChat({
        users: [users[0].id],
        chatId: createChatResponse.id,
      });

      const chats = await this.chatAPI.getChats({ offset: 0, limit: 100 });
      Store.setState("chats", chats);

      this.render();
    } catch (error) {
      console.error("Ошибка при поиске пользователей:", error);
      this.props.error = "Ошибка при поиске пользователей";
      this.props.searchResults = [];
      this.props.canCreate = false;
      console.log("handleSearch error RENDER");
      this.render();
    }
  }
}
