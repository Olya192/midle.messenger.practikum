import { AuthAPI } from "../../api/auth-api";
import { UserAPI, type ChangeProfileRequest } from "../../api/user-api";
import Block from "../../framework/Block";
import { type Profile, type Redact } from "../../mock/profile";
import Store from "../../store/Store";
import { getRouter } from "../../utils/navigation";

// Данные для смены пароля
const PASSWORD_REDACT_DATA: Redact[] = [
  {
    label: "Старый пароль",
    text: "",
    type: "password",
    name: "old_password",
    ref: "old_password",
  },
  {
    label: "Новый пароль",
    text: "",
    type: "password",
    name: "new_password",
    ref: "new_password",
  },
  {
    label: "Повторите новый пароль",
    text: "",
    type: "password",
    name: "confirm_password",
    ref: "confirm_password",
  },
];

interface ProfilePageProps {
  profile?: Profile[];
  profileRedact?: Redact[];
  passwordRedact?: Redact[];
  userName?: string;
  avatarUrl?: string;
  [key: string]: unknown;
}

interface APIError {
  message?: string;
  status?: number;
  reason?: string;
}

export class ProfilePage extends Block<ProfilePageProps> {
  static componentName = "ProfilePage";
  private userAPI: UserAPI;
  private storeUnsubscribe?: () => void;
  private dataLoaded = false;
  private isUpdating = false;
  private isLoading = false; // Флаг для предотвращения множественных запросов
  private lastUserData: string = ""; // Для сравнения данных
 // Флаг для предотвращения рекурсии

  protected template = `  <main class="profile">
     {{{ButtonBack props=this}}}  
      <div class="profile__container">
        <div class="profile__main">
          <form class="profile__image">
            <label for="avatar" class="profile__image-label">
              {{#if avatarUrl}}
                <img src="{{avatarUrl}}" alt="Аватар" class="profile__avatar">
              {{else}}
                <img src="../../../public/Union.svg" alt="Загрузить аватар" class="profile__avatar-img">
              {{/if}}
            </label>
            <input type="file" name="avatar" id="avatar" class="profile__input" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" hidden>
          </form>          
          <p class="profile__name">{{userName}}</p>
        </div> 
        
        <div class="profile__inform-cards">
          <!-- Блок с информацией о пользователе -->
          <div id='profile' class="profile__input-content">
            {{#if profile}}
              {{#each profile}}
                {{{InformCard title=title text=text id=@index}}}
              {{/each}}
            {{else}}
              <p>Загрузка данных...</p>
            {{/if}}
          </div>
        
          <!-- Блок редактирования данных пользователя -->
          <div id='profileRedact' class="profile__input-content" style="display: none;">
            <h3 class="profile__form-title">Редактирование данных</h3>
            <!-- Отладочная информация -->
  <div style="background: yellow; padding: 10px; margin: 10px;">
    Debug: profileRedact = {{#if profileRedact}}Есть данные ({{profileRedact.length}} полей){{else}}Нет данных{{/if}}
  </div>
            {{#if profileRedact}}
              {{#each profileRedact}}
                <div class="profile__input-box">
                  <label for="{{name}}_profile">{{label}}</label>
                  <input
                    type="{{type}}"
                    name="{{name}}"
                    value="{{text}}"
                    id="{{name}}_profile"
                    class="profile__input-field"
                  />
                  <div class="main-form__error-message" data-error="{{name}}"></div>
                </div>
              {{/each}}
            {{else}}
              <p>Загрузка данных...</p>
            {{/if}}
            <div class="profile__action-buttons">
              <button type="button" class="profile__button-save" data-action="saveProfile">Сохранить</button>
              <button type="button" class="profile__button-back" data-action="backToProfile">Назад</button>
            </div>
          </div>

          <!-- Блок смены пароля -->
          <div id='passwordRedact' class="profile__input-content" style="display: none;">
            <h3 class="profile__form-title">Изменение пароля</h3>
            {{#if passwordRedact}}
              {{#each passwordRedact}}
                <div class="profile__input-box">
                  <label for="{{name}}_password">{{label}}</label>
                  <input
                    type="{{type}}"
                    name="{{name}}"
                    value="{{text}}"
                    id="{{name}}_password"
                    class="profile__input-field"
                  />
                  <div class="main-form__error-message" data-error="{{name}}"></div>
                </div>
              {{/each}}
            {{else}}
              <p>Загрузка данных...</p>
            {{/if}}
            <div class="profile__action-buttons">
              <button type="button" class="profile__button-save" data-action="savePassword">Сохранить</button>
              <button type="button" class="profile__button-back" data-action="backToProfile">Назад</button>
            </div>
          </div>
        </div>
        
        <div class="profile__buttons">
          <p class="profile__button-activ" data-action="editProfile">Изменить данные</p>
          <p class="profile__button-activ" data-action="editPassword">Изменить пароль</p>
          <p class="profile__button-exit" data-action="logout">Выйти</p> 
        </div>
      </div> 
    </main>
`;

  constructor(props: ProfilePageProps = {}) {
    const user = Store.getUser();
    const isMockUser = !user || user.id === 0;

    const initialProps: ProfilePageProps = {
      ...props,
      profile: isMockUser ? undefined : ProfilePage.getUserProfileData(),
      profileRedact: isMockUser
        ? undefined
        : ProfilePage.getUserProfileRedactData(),
      passwordRedact: PASSWORD_REDACT_DATA,
      userName: isMockUser ? "Загрузка..." : user?.first_name,
      avatarUrl: isMockUser ? undefined : ProfilePage.getUserAvatarUrl(),
    };

    super(initialProps);
    this.userAPI = new UserAPI();
  }

  private static getUserAvatarUrl(): string | undefined {
    const user = Store.getUser();

    if (!user || user.id === 0 || !user.avatar) {
      return undefined;
    }

    if (
      user.avatar.startsWith("http://") ||
      user.avatar.startsWith("https://")
    ) {
      return user.avatar;
    }

    const BASE_URL = "https://ya-praktikum.tech/api/v2";
    return `${BASE_URL}/resources${user.avatar}`;
  }

  private async handleAvatarUpload(file: File): Promise<void> {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Пожалуйста, выберите файл в формате JPEG, JPG, PNG, GIF или WebP");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Файл слишком большой. Максимальный размер 5MB");
      return;
    }

    try {
      this.showAvatarLoading(true);
      await this.userAPI.changeAvatar(file);
      await this.loadUserIfNeeded(); // Перезагружаем данные после обновления аватара
    } catch (error) {
      console.error("Ошибка при загрузке аватара:", error);
      alert("Ошибка при загрузке аватара");
    } finally {
      this.showAvatarLoading(false);
    }
  }

  private showAvatarLoading(isLoading: boolean): void {
    const rootElement = this.element();
    if (!rootElement) return;

    const avatarLabel = rootElement.querySelector(
      ".profile__image-label",
    ) as HTMLElement;

    if (avatarLabel) {
      avatarLabel.style.opacity = isLoading ? "0.5" : "1";
      avatarLabel.style.cursor = isLoading ? "wait" : "pointer";
    }
  }

  private setupAvatarUpload(): void {
    const rootElement = this.element();
    if (!rootElement) return;

    const fileInput = rootElement.querySelector("#avatar") as HTMLInputElement;
    if (!fileInput) return;

    // Удаляем старый обработчик
    const newFileInput = fileInput.cloneNode(true) as HTMLInputElement;
    fileInput.parentNode?.replaceChild(newFileInput, fileInput);

    newFileInput.addEventListener("change", async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        await this.handleAvatarUpload(file);
      }
      target.value = "";
    });
  }

   private async loadUserIfNeeded(): Promise<void> {
    // Предотвращаем множественные запросы
    if (this.isLoading) {
      console.log('Already loading user, skipping...');
      return;
    }

    if (this.dataLoaded) {
      console.log('Data already loaded');
      return;
    }

    this.isLoading = true;

    try {
      const user = Store.getUser();
      console.log('Current user from store:', user);

      if (user && user.id !== 0) {
        console.log('User found in store, id:', user.id);
        this.dataLoaded = true;
        this.updateProfileData();
        this.isLoading = false;
        return;
      }

      console.log('Loading user from API...');
      const authAPI = new AuthAPI();
      const userData = await authAPI.getUser();
      console.log('User data from API:', userData);

      if (userData && userData.id !== 0) {
        this.dataLoaded = true;
        Store.setUser(userData);
        this.updateProfileData();
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      const router = getRouter();
      router.go("/");
    } finally {
      this.isLoading = false;
    }
  }

  private static getUserProfileData(): Profile[] {
    const user = Store.getUser();

    if (!user || user.id === 0) {
      return [];
    }

    return [
      { title: "Почта", text: user.email },
      { title: "Логин", text: user.login },
      { title: "Имя", text: user.first_name },
      { title: "Фамилия", text: user.second_name },
      { title: "Имя в чате", text: user.display_name || user.first_name },
      { title: "Телефон", text: user.phone },
    ];
  }

  private static getUserProfileRedactData(): Redact[] {
    const user = Store.getUser();

    if (!user || user.id === 0) {
      return [];
    }

    return [
      {
        label: "Почта",
        text: user.email,
        type: "email",
        name: "email",
        ref: "email",
      },
      {
        label: "Логин",
        text: user.login,
        type: "text",
        name: "login",
        ref: "login",
      },
      {
        label: "Имя",
        text: user.first_name,
        type: "text",
        name: "first_name",
        ref: "first_name",
      },
      {
        label: "Фамилия",
        text: user.second_name,
        type: "text",
        name: "second_name",
        ref: "second_name",
      },
      {
        label: "Имя в чате",
        text: user.display_name || user.first_name,
        type: "text",
        name: "display_name",
        ref: "display_name",
      },
      {
        label: "Телефон",
        text: user.phone,
        type: "tel",
        name: "phone",
        ref: "phone",
      },
    ];
  }

   private updateProfileData(): void {
    // Предотвращаем рекурсивные обновления
    if (this.isUpdating) {
      console.log('Already updating, skipping...');
      return;
    }
    
    this.isUpdating = true;
    
    try {
      const user = Store.getUser();

      if (!user || user.id === 0) {
        console.log('No valid user');
        return;
      }

      // Создаем строку для сравнения данных
      const currentUserData = JSON.stringify({
        profile: this.props.profile,
        profileRedact: this.props.profileRedact,
        avatarUrl: this.props.avatarUrl,
        userName: this.props.userName
      });

      const newProfile = ProfilePage.getUserProfileData();
      const newProfileRedact = ProfilePage.getUserProfileRedactData();
      const newAvatarUrl = ProfilePage.getUserAvatarUrl();

      const newUserData = JSON.stringify({
        profile: newProfile,
        profileRedact: newProfileRedact,
        avatarUrl: newAvatarUrl,
        userName: user.first_name
      });

      // Обновляем только если данные действительно изменились
      if (currentUserData !== newUserData) {
        console.log('Data changed, updating props...');
        
        // Обновляем props без вызова render через setProps
        this.props.profile = newProfile;
        this.props.profileRedact = newProfileRedact;
        this.props.passwordRedact = PASSWORD_REDACT_DATA;
        this.props.userName = user.first_name;
        this.props.avatarUrl = newAvatarUrl;
        
        // Вызываем render только один раз
        this.render();
      } else {
        console.log('No data changes');
      }
    } finally {
      this.isUpdating = false;
    }
  }

  private showActiveBlock(activeSection: string): void {
    // Используем requestAnimationFrame для избежания конфликтов с рендерингом
    requestAnimationFrame(() => {
      const rootElement = this.element();
      if (!rootElement) return;

      const profileBlock = rootElement.querySelector("#profile") as HTMLElement;
      const profileRedactBlock = rootElement.querySelector("#profileRedact") as HTMLElement;
      const passwordRedactBlock = rootElement.querySelector("#passwordRedact") as HTMLElement;

      if (profileBlock) profileBlock.style.display = "none";
      if (profileRedactBlock) profileRedactBlock.style.display = "none";
      if (passwordRedactBlock) passwordRedactBlock.style.display = "none";

      if (activeSection === "profile" && profileBlock) {
        profileBlock.style.display = "block";
      } else if (activeSection === "redactInform" && profileRedactBlock) {
        profileRedactBlock.style.display = "block";
      } else if (activeSection === "redactPassword" && passwordRedactBlock) {
        passwordRedactBlock.style.display = "block";
      }
    });
  }

  private async handleLogout() {
    const authAPI = new AuthAPI();
    const router = getRouter();
    await authAPI.logout();
    router.go("/");
  }

  private async saveProfile(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const formData = this.collectFormData("#profileRedact");

      const profileData: ChangeProfileRequest = {
        first_name: formData.first_name || "",
        second_name: formData.second_name || "",
        display_name: formData.display_name || formData.first_name || "",
        login: formData.login || "",
        email: formData.email || "",
        phone: formData.phone || "",
      };

      if (!profileData.first_name || !profileData.second_name || 
          !profileData.login || !profileData.email || !profileData.phone) {
        alert("Пожалуйста, заполните все обязательные поля");
        return;
      }
      
      const updatedUser = await this.userAPI.changeProfile(profileData);
      Store.setUser(updatedUser);
      
      // Обновляем данные без дополнительных запросов
      this.dataLoaded = true;
      this.updateProfileData();
      this.showActiveBlock("profile");
      Store.setInputContent("profile");

    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Ошибка при обновлении профиля");
    } finally {
      this.isLoading = false;
    }
  }

   private async savePassword(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const formData = this.collectFormData("#passwordRedact");
      
      const oldPassword = formData.old_password || "";
      const newPassword = formData.new_password || "";
      const confirmPassword = formData.confirm_password || "";

      if (!oldPassword || !newPassword || !confirmPassword) {
        alert("Пожалуйста, заполните все поля");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Новый пароль и подтверждение не совпадают");
        return;
      }

      if (newPassword.length < 8) {
        alert("Пароль должен содержать не менее 8 символов");
        return;
      }
      
      await this.userAPI.changePassword({
        oldPassword,
        newPassword,
      });
      
      this.showActiveBlock("profile");
      Store.setInputContent("profile");
      this.clearFormData("#passwordRedact");
      
      alert("Пароль успешно изменен");
    } catch (error) {
      const apiError = error as APIError;
      
      if (apiError.status === 401 || apiError.reason === "Password is incorrect") {
        alert("Неверный текущий пароль");
      } else {
        alert("Ошибка при изменении пароля");
      }
    } finally {
      this.isLoading = false;
    }
  }

  private collectFormData(selector: string): Record<string, string> {
    const rootElement = this.element();
    if (!rootElement) return {};

    const container = rootElement.querySelector(selector);
    const inputs = container?.querySelectorAll("input");
    const data: Record<string, string> = {};

    inputs?.forEach((input) => {
      if (input.name) {
        data[input.name] = input.value;
      }
    });

    return data;
  }

  private clearFormData(selector: string): void {
    const rootElement = this.element();
    if (!rootElement) return;

    const container = rootElement.querySelector(selector);
    const inputs = container?.querySelectorAll("input");

    inputs?.forEach((input) => {
      if (input.type !== "file") {
        input.value = "";
      }
    });
  }

  private backToProfile(): void {
    Store.setInputContent("profile");
    this.showActiveBlock("profile");
    this.updateProfileData();
    this.clearFormData("#profileRedact");
    this.clearFormData("#passwordRedact");
  }

  protected events = {
    click: (e: Event) => {
      const target = e.target as HTMLElement;
      const action = target.getAttribute("data-action");

      if (action === "editProfile") {
        Store.setInputContent("redactInform");
        this.showActiveBlock("redactInform");
      } else if (action === "editPassword") {
        Store.setInputContent("redactPassword");
        this.showActiveBlock("redactPassword");
      } else if (action === "logout") {
        this.handleLogout();
      } else if (action === "saveProfile") {
        this.saveProfile();
      } else if (action === "savePassword") {
        this.savePassword();
      } else if (action === "backToProfile") {
        this.backToProfile();
      }
    },
  };

   public componentDidMount(): void {
  // Подписываемся на изменения стора с debounce
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  this.storeUnsubscribe = Store.subscribe(() => {
    // Debounce обновлений
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      if (this.dataLoaded && !this.isUpdating && !this.isLoading) {
        this.updateProfileData();
        const currentSection = Store.getInputContent();
        this.showActiveBlock(currentSection);
      }
    }, 100);
  });

  // Загружаем пользователя
  this.loadUserIfNeeded();
  
  // Показываем активный блок
  const currentSection = Store.getInputContent();
  this.showActiveBlock(currentSection);
  
  // Настраиваем загрузку аватара
  setTimeout(() => {
    this.setupAvatarUpload();
  }, 100);
}

  public componentDidUpdate(): void {
    // Настраиваем загрузку аватара только если элемент существует
    if (this.element()) {
      this.setupAvatarUpload();
    }
  }

  public componentWillUnmount(): void {
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
    }
  }
}
