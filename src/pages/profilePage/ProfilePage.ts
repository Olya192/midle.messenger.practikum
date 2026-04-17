import { AuthAPI } from "../../api/auth-api";
import { UserAPI, type ChangeProfileRequest } from "../../api/user-api";
import Block from "../../framework/Block";
import {
  passwordRedact,
  profile,
  profileRedact,
  type Profile,
  type Redact,
} from "../../mock/profile";
import Store from "../../store/Store";
import { getRouter } from "../../utils/navigation";

interface ProfilePageProps {
  profile?: Profile[];
  profileRedact?: Redact[];
  passwordRedact?: Redact[];
  userName?: string;
  _updateKey?: number; // Добавляем для форсирования обновления
  _timestamp?: number;
  [key: string]: unknown; // для других возможных пропсов
}
export class ProfilePage extends Block {
  static componentName = "ProfilePage";

  private storeUnsubscribe?: () => void;

  private isUpdating = false;
  private dataLoaded = false; // Флаг, что данные уже загружены

  protected template = `  <main class="profile">
     {{{ButtonBack props=this}}}  
      <div class="profile__container">
        <div class="profile__main">
          <form class="profile__image">
            <label for="avatar" class="profile__image-label">
              <img src="../../../public/Union.svg" alt="Загрузить аватар">
            </label>
            <input type="file" name="avatar" id="avatar" class="profile__input" accept="image/*" hidden>
          </form>          
          <p class="profile__name">{{userName}}</p>
        </div> 
        
        <div class="profile__inform-cards">
          <div id='profile' class="profile__input-content">
            {{#if profile}}
              {{#each profile}}
                {{{InformCard title=title text=text id=@index}}}
              {{/each}}
            {{else}}
              <p>Загрузка данных...</p>
            {{/if}}
          </div>
        
          <div id='profileRedact' class="profile__input-content">
            {{#if profileRedact}}
              {{#each profileRedact}}
                {{{InputProfile type=this.type name=this.name text=this.text label=this.label ref=this.ref}}}
              {{/each}}
            {{else}}
              <p>Загрузка данных...</p>
            {{/if}}
          </div>

          <div id='passwordRedact' class="profile__input-content"> 
            {{#each passwordRedact}}
              {{{InputProfile type=this.type name=this.name text=this.text label=this.label ref=this.ref}}}
            {{/each}}
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

    // Показываем заглушку, если это моковый пользователь
    const isMockUser = !user || user.id === 0;

    const initialProps: ProfilePageProps = {
      ...props,
      profile: isMockUser ? undefined : ProfilePage.getUserProfileData(),
      profileRedact: isMockUser
        ? undefined
        : ProfilePage.getUserProfileRedactData(),
      passwordRedact: passwordRedact,
      userName: isMockUser ? "Загрузка..." : user?.first_name,
    };

    super(initialProps);
  }

  private async loadUserIfNeeded(): Promise<void> {
    // Если данные уже загружены, не загружаем снова
    if (this.dataLoaded) return;

    const user = Store.getUser();
    console.log("Current user in Store before load:", user);

    // Проверяем, что это не моковый пользователь (id !== 0)
    if (user && user.id !== 0) {
      console.log("Real user already in Store");
      this.dataLoaded = true;
      this.updateProfileData();
      return;
    }

    try {
      const authAPI = new AuthAPI();
      const userData = await authAPI.getUser();
      console.log("Loaded user from API:", userData);

      if (userData && userData.id !== 0) {
        // Устанавливаем флаг ДО обновления Store, чтобы prevent цикл
        this.dataLoaded = true;

        // Обновляем Store
        Store.setUser(userData);

        // Обновляем данные (setProps вызовет render)
        this.updateProfileData();
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      this.dataLoaded = false;
      const router = getRouter();
      router.go("/");
    }
  }

  // Преобразование данных пользователя из Store в нужный формат
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

  // Обновление данных на странице
  private updateProfileData(): void {
    if (this.isUpdating) return;

    this.isUpdating = true;

    const user = Store.getUser();
    console.log("updateProfileData - user from Store:", user);

    if (!user || user.id === 0) {
      console.log("Mock user detected, waiting for real data");
      this.isUpdating = false;
      return;
    }

    const newProfile = ProfilePage.getUserProfileData();
    const newProfileRedact = ProfilePage.getUserProfileRedactData();

    const currentProfile = this.props.profile as Profile[] | undefined;
    const currentProfileRedact = this.props.profileRedact as
      | Redact[]
      | undefined;

    const profileChanged =
      JSON.stringify(currentProfile) !== JSON.stringify(newProfile);
    const profileRedactChanged =
      JSON.stringify(currentProfileRedact) !== JSON.stringify(newProfileRedact);

    if (profileChanged || profileRedactChanged) {
      console.log("Updating with real user data:", newProfile);
      this.setProps({
        profile: newProfile,
        profileRedact: newProfileRedact,
        passwordRedact: passwordRedact,
        userName: user.first_name,
      });
    }

    this.isUpdating = false;
  }
  private showActiveBlock(activeSection: string): void {
    const rootElement = this.element();
    if (!rootElement) return;

    const profileBlock = rootElement.querySelector("#profile") as HTMLElement;
    const profileRedactBlock = rootElement.querySelector(
      "#profileRedact",
    ) as HTMLElement;
    const passwordRedactBlock = rootElement.querySelector(
      "#passwordRedact",
    ) as HTMLElement;

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
  }
  private async handleLogout() {
    const authAPI = new AuthAPI();
    const router = getRouter();
    await authAPI.logout();
    router.go("/");
  }

  private async saveProfile(): Promise<void> {
    const formData = this.collectFormData("#profileRedact");
    const userAPI = new UserAPI();

    const profileData: ChangeProfileRequest = {
      first_name: formData.first_name || "",
      second_name: formData.second_name || "",
      display_name: formData.display_name || formData.first_name || "",
      login: formData.login || "",
      email: formData.email || "",
      phone: formData.phone || "",
    };

    try {
      await userAPI.changeProfile(profileData);
      this.showActiveBlock("profile");
      // Не обновляем данные здесь - они обновятся через subscribe
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  }
  private collectFormData(selector: string): Record<string, string> {
    const container = this.element()?.querySelector(selector);
    const inputs = container?.querySelectorAll("input");
    const data: Record<string, string> = {};

    inputs?.forEach((input) => {
      if (input.name) {
        data[input.name] = input.value;
      }
    });

    return data;
  }

  private handleCancel(): void {
    Store.setInputContent("profile");
    this.showActiveBlock("profile");
    this.updateProfileData();
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
      } else if (action === "save") {
        const currentSection = Store.getInputContent();
        if (currentSection === "redactInform") {
          this.saveProfile();
        } else if (currentSection === "redactPassword") {
          // this.savePassword();
        }
      } else if (action === "cancel") {
        this.handleCancel();
      }
    },
  };

  public componentDidMount(): void {
    // Подписываемся на изменения в сторе
    this.storeUnsubscribe = Store.subscribe(() => {
      // Проверяем, что данные уже загружены, чтобы избежать цикла
      if (this.dataLoaded) {
        this.updateProfileData();
        this.showActiveBlock(Store.getInputContent());
      }
    });

    // Загружаем данные пользователя
    this.loadUserIfNeeded();

    // Показываем активный блок
    this.showActiveBlock(Store.getInputContent());
  }

  public componentWillUnmount(): void {
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
    }
  }
}
