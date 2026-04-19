import Handlebars from "handlebars";
import "./styles/styles.pcss";

import { type AuthService } from "./mock/authorization.ts";
import { type Profile, type Redact } from "./mock/profile.ts";
import { type Contacts, type Messages, type MockData } from "./mock/chats.ts";
import Block, { type BlockOwnProps } from "./framework/Block.ts";
// import { registerComponent } from "./framework/ComponentRegistry.ts";

// import { InputForm } from "./components/input/InputForm.ts";
import { AutorizationPage } from "./pages/autorizationPage/autorizationPage.ts";
// import { ButtonForm } from "./components/button/ButtonForm.ts";
// import { Link } from "./components/link/Link.ts";
// import { ChatsPage } from "./pages/chatsPage/ChatsPage.ts";
// import { ButtonBack } from "./components/button/ButtonBack.ts";
// import { ChatsCard } from "./components/chatsCard/ChatsCard.ts";
// import { MessagesCard } from "./components/messegCard/MessagesCard.ts";
// import { InformCard } from "./components/imformCard/InformCard.ts";
// import { AuthorizForm } from "./components/form/AuthorizForm.ts";
// import { RegisdtrationForm } from "./components/form/RegisdtrationForm.ts";
// import { InputProfile } from "./components/input/InputProfile.ts";
// import { Footer } from "./components/footer/Footer.ts";
import { Error404 } from "./pages/errors/404errorPage.ts";
import { Error500 } from "./pages/errors/500errorPage.ts";
import { ProfilePage } from "./pages/profilePage/ProfilePage.ts";
import { RegisdtrationPage } from "./pages/regisdtrationPage/RegisdtrationPage.ts";
import Router from "./framework/Router.ts";
import type { BlockFactory, FieldType } from "./types/type.ts";
import { initRouter } from "./utils/navigation.ts";
import { ChatsPage } from "./pages/chatsPage/ChatsPage.ts";

interface FormProps extends BlockOwnProps {
  buttonName?: string;
  authorization?:
    | AuthService
    | {
        input: Array<{
          type: FieldType;
          name: string;
          ref: string;
          label: string;
        }>;
        button: string;
        link: {
          text: string;
          href: string;
        };
      };
  registration?: AuthService;
  mockContacts?: Contacts[];
  mockMessages?: Messages[];
  mockData?: MockData;
  profile?: Profile[];
  profileRedact?: Redact[] | undefined;
}

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

Handlebars.registerHelper('stringifyFunc', function(fn) {
    return new Handlebars.SafeString("(" + fn.toString() + ")()");
});


// registerComponent(InputForm);
// registerComponent(ButtonForm);
// registerComponent(Link);
// registerComponent(ChatsCard);
// registerComponent(MessagesCard);
// registerComponent(InformCard);
// registerComponent(InputProfile);
// registerComponent(AuthorizForm);
// registerComponent(ButtonBack);
// registerComponent(RegisdtrationForm);
// registerComponent(Footer);

// registerComponent(ChatsPage);
// registerComponent(AutorizationPage);
// registerComponent(Error404);
// registerComponent(Error500);
// registerComponent(ProfilePage);
// registerComponent(RegisdtrationPage);

export default class App extends Block<FormProps> {
  private router: Router;
  private appElement: HTMLElement | null;

  constructor(props: FormProps) {
    super(props);
    this.appElement = document.getElementById("app");
    this.router = initRouter("#app");
    this.setupRoutes();
  }

  protected template = `<div></div>`;

  protected componentDidMount(): void {
    // Запускаем роутер после монтирования
    this.router.start();
    // Добавляем обработчик для навигации по ссылкам с data-navigate
    this.setupNavigationListeners();
  }

  private setupNavigationListeners(): void {
    document.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("[data-navigate]");

      if (link) {
        e.preventDefault();
        const path = link.getAttribute("data-navigate");
        if (path) {
          this.router.go(path);
        }
      }
    });
  }

  private setupRoutes(): void {
    const createAuthPage: BlockFactory = () => {
      return new AutorizationPage({
        authorization: this.props.authorization,
      });
    };

    const createRegisterPage = (): Block<BlockOwnProps> => {
      return new RegisdtrationPage({
        registration: this.props.registration,
      });
    };

    const createChatsPage = (): Block<BlockOwnProps> => {
      return new ChatsPage({
        mockContacts: this.props.mockContacts,
        mockMessages: this.props.mockMessages,
        mockData: this.props.mockData,
      });
    };

    const createProfilePage = (): Block<BlockOwnProps> => {
      return new ProfilePage({
        profile: this.props.profile,
        profileRedact: this.props.profileRedact,
        inputContent: "profile", // начальное состояние
      });
    };

    const create404Page = (): Block<BlockOwnProps> => {
      return new Error404({});
    };

    const create500Page = (): Block<BlockOwnProps> => {
      return new Error500({});
    };

    // Регистрируем маршруты
    this.router
      .use("/", createAuthPage)
      .use("/sign-up", createRegisterPage)
      .use("/messenger", createChatsPage)
      .use("/settings", createProfilePage)
      .use("/404", create404Page)
      .use("/500", create500Page);
  }

  public navigateTo(path: string): void {
    this.router.go(path);
  }

  public navigateToPage(pageName: string): void {
    const routes: Record<string, string> = {
      authPage: "/",
      registrPage: "/sign-up",
      chatsPage: "/messenger",
      profilePage: "/settings",
      NotFoundErr: "/404",
      ServerError: "/500",
    };

    const path = routes[pageName] || "/";
    this.navigateTo(path);
  }

  protected render(): void {
    const fragment = this.compile();
    if (fragment && this.appElement) {
      this.appElement.innerHTML = "";
      this.appElement.appendChild(fragment);
    }
    this.componentDidMount();
  }
}
