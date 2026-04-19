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
  onSearch?: () => void;
  onSelectUser?: (e: Event) => void;
  onCreateChat?: () => void;
  preventClose?: (e: Event) => void;
}

export class AddChatModal extends Block<AddChatModalProps> {
  static componentName = "AddChatModal";
  
  private userAPI = new UserAPI();
  private chatAPI = new ChatAPI();
  private foundUsers: ChatUser[] = [];

  protected template = `
    <div class="modal-overlay" onclick={{onClose}}>
      <div class="modal" onclick={{preventClose}}>
        <div class="modal__header">
          <h2>Создать новый чат</h2>
          <button class="modal__close" onclick={{onClose}}>×</button>
        </div>
        
        <div class="modal__body">
          <div class="modal__search">
            <input 
              type="text" 
              placeholder="Введите логин пользователя" 
              class="modal__input"
              id="user-search-input"
            />
            <button class="modal__search-btn" onclick={{onSearch}}>Найти</button>
          </div>
          
          {{#if searchResults}}
            {{#if searchResults.length}}
              <div class="modal__results">
                <h3>Результаты поиска:</h3>
                <div class="modal__users-list">
                  {{#each searchResults}}
                    <div class="modal__user-item {{#if selected}}modal__user-item--selected{{/if}}" onclick={{../onSelectUser}} data-user-id="{{id}}">
                      <img src="{{#if avatar}}https://ya-praktikum.tech/api/v2/resources{{avatar}}{{else}}../../../public/default-avatar.svg{{/if}}" alt="{{login}}" class="modal__user-avatar">
                      <div class="modal__user-info">
                        <p class="modal__user-name">{{first_name}} {{second_name}}</p>
                        <p class="modal__user-login">@{{login}}</p>
                      </div>
                    </div>
                  {{/each}}
                </div>
              </div>
            {{/if}}
          {{/if}}
          
          {{#if error}}
            <div class="modal__error">{{error}}</div>
          {{/if}}
        </div>
        
        <div class="modal__footer">
          <button class="modal__btn modal__btn--secondary" onclick={{onClose}}>Отмена</button>
          <button class="modal__btn modal__btn--primary" onclick={{onCreateChat}} {{#unless canCreate}}disabled{{/unless}}>
            Создать чат
          </button>
        </div>
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
      onSearch: () => this.handleSearch(),
      onSelectUser: (e: Event) => this.handleSelectUser(e),
      onCreateChat: () => this.handleCreateChat(),
      preventClose: (e: Event) => e.stopPropagation(),
    } as AddChatModalProps);
  }

  private async handleSearch(): Promise<void> {
    const input = document.getElementById("user-search-input") as HTMLInputElement;
    const login = input?.value.trim();
    
    if (!login) {
      this.props.error = "Введите логин пользователя";
      this.render();
      return;
    }

    try {
      this.props.error = "";
      this.props.searchResults = [];
      this.render();
      
      const users = await this.userAPI.searchUsers(login) as ChatUser[];
      
      if (users.length === 0) {
        this.props.error = "Пользователи не найдены";
        this.props.searchResults = [];
        this.props.canCreate = false;
        this.render();
        return;
      }

      this.foundUsers = users;
      
      const searchResults: SearchResultUser[] = users.map((user: ChatUser) => ({
        ...user,
        selected: false
      }));

      this.props.searchResults = searchResults;
      this.props.error = "";
      this.props.canCreate = false;
      this.props.selectedUserId = undefined;
      this.render();
      
    } catch (error) {
      console.error("Ошибка при поиске пользователей:", error);
      this.props.error = "Ошибка при поиске пользователей";
      this.props.searchResults = [];
      this.props.canCreate = false;
      this.render();
    }
  }

  private handleSelectUser(e: Event): void {
    const target = e.currentTarget as HTMLElement;
    const userId = Number(target.dataset.userId);
    
    if (!userId) return;

    const currentSearchResults = this.props.searchResults || [];
    
    const searchResults = currentSearchResults.map((user: SearchResultUser) => ({
      ...user,
      selected: user.id === userId
    }));

    this.props.searchResults = searchResults;
    this.props.canCreate = true;
    this.props.error = "";
    this.props.selectedUserId = userId;
    this.render();
  }

  private async handleCreateChat(): Promise<void> {
    const selectedUserId = this.props.selectedUserId;
    
    if (!selectedUserId) {
      this.props.error = "Выберите пользователя";
      this.render();
      return;
    }

    const selectedUser = this.foundUsers.find((u: ChatUser) => u.id === selectedUserId);
    
    if (!selectedUser) {
      this.props.error = "Пользователь не найден";
      this.render();
      return;
    }

    try {
      const currentUser = Store.getUser();
      const chatTitle = `${currentUser?.first_name || 'Чат'} и ${selectedUser.first_name}`;
      
      const createChatResponse = await this.chatAPI.createChat({
        title: chatTitle
      });

      await this.chatAPI.addUsersToChat({
        users: [selectedUser.id],
        chatId: createChatResponse.id
      });

      const chats = await this.chatAPI.getChats({ offset: 0, limit: 100 });
      Store.setState("chats", chats);

      if (this.props.onChatCreated) {
        this.props.onChatCreated();
      }

      if (this.props.onClose) {
        this.props.onClose();
      }

    } catch (error) {
      console.error("Ошибка при создании чата:", error);
      this.props.error = "Ошибка при создании чата. Попробуйте позже.";
      this.render();
    }
  }
}
