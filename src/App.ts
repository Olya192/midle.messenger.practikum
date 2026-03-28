import Handlebars from "handlebars";
import "./styles/styles.pcss";

import {
  authorization,
  registration,
  type AuthService,
} from "./mock/authorization.ts";
import { profile, passwordRedact, profileRedact } from "./mock/profile.ts";
import { mockContacts, mockMessages, mockData } from "./mock/chats.ts";
import Block, { type BlockOwnProps } from "./framework/Block.ts";
import { registerComponent } from "./framework/ComponentRegistry.ts";

import { InputForm } from "./components/input/InputForm.ts";
import { AutorizationPage } from "./pages/autorizationPage/autorizationPage.ts";
import { ButtonForm } from "./components/button/ButtonForm.ts";
import { Link } from "./components/link/Link.ts";
import { ChatsPage } from "./pages/chatsPage/ChatsPage.ts";
import { ButtonBack } from "./components/button/ButtonBack.ts";
import { ChatsCard } from "./components/chatsCard/ChatsCard.ts";
import { MessagesCard } from "./components/messegCard/MessagesCard.ts";
import { InformCard } from "./components/imformCard/InformCard.ts";
import { AuthorizForm } from "./components/form/AuthorizForm.ts";
import { RegisdtrationForm } from "./components/form/RegisdtrationForm.ts";
import { InputProfile } from "./components/input/InputProfile.ts";
import { Footer } from "./components/footer/Footer.ts";
import { Error404 } from "./pages/errors/404errorPage.ts";
import { Error500 } from "./pages/errors/500errorPage.ts";
import { RedactProfilePagee } from "./pages/profilePage/RedactProfilePage.ts";
import { ProfilePage } from "./pages/profilePage/ProfilePage.ts";
import { RegisdtrationPage } from "./pages/regisdtrationPage/RegisdtrationPage.ts";

interface FormProps extends BlockOwnProps {
  buttonName?: string;
  authorization?: AuthService;
  registration?: AuthService;
}

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

registerComponent(ChatsPage);
registerComponent(AutorizationPage);
registerComponent(Error404);
registerComponent(Error500);
registerComponent(RedactProfilePagee);
registerComponent(ProfilePage);
registerComponent(RegisdtrationPage);

registerComponent(InputForm);
registerComponent(ButtonForm);
registerComponent(Link);
registerComponent(ButtonBack);
registerComponent(ChatsCard);
registerComponent(MessagesCard);
registerComponent(InformCard);
registerComponent(AuthorizForm);
registerComponent(RegisdtrationForm);
registerComponent(InputProfile);
registerComponent(Footer);

export default class App extends Block<FormProps> {
  state: {
    currentPage: string;
  };
  appElement: HTMLElement | null;
  currentComponent: Block | null;

  constructor() {
    super({
      authorization: authorization, // Передаем через пропсы
      registration: registration,
      mockContacts: mockContacts,
      mockMessages: mockMessages,
      profileRedact:profileRedact,
      passwordRedact:passwordRedact
    } as FormProps);
    this.state = {
      currentPage: "authPage",
    };
    this.appElement = document.getElementById("app");
    this.currentComponent = null;
  }

  protected template = `{{{ AutorizationPage authorization=authorization}}}`;

  protected componentDidMount() {
    console.log("form component mounted");
  }

  render() {
    if (!this.appElement) return;

    const { currentPage } = this.state;

    // Очищаем контейнер
    this.appElement.innerHTML = "";

    // Создаем и монтируем компонент текущей страницы
    const component = this.createPageComponent(currentPage);
    if (component) {
      const element = component.element();
      if (element) {
        this.appElement.appendChild(element);
      }
      this.currentComponent = component;
    }

    this.attachEventListener();
  }

  private createPageComponent(page: string): Block | null {
    switch (page) {
      case "authPage":
        return new AutorizationPage({ authorization });
      case "registrPage":
        return new RegisdtrationPage({ registration });
      case "chatsPage":
        return new ChatsPage({ mockContacts, mockMessages, mockData });
      case "profilePage":
        return new ProfilePage({ profile });
      case "redactProfilePage":
        return new RedactProfilePagee({ redactData: profileRedact });
      case "redactProfilePagePass":
        return new RedactProfilePagee({ redactData: passwordRedact });
      case "NotFoundErr":
        return new Error404({});
      case "ServerError":
        return new Error500({});
      default:
        return null;
    }
  }

  attachEventListener() {
    const footerLinks = document.querySelectorAll(".navigation");
    footerLinks.forEach((link) => {
      link.addEventListener("click", (e: Event) => {
        e.preventDefault();

        const target = e.target as HTMLElement;
        if (target?.dataset?.page) {
          this.changePage(target.dataset.page);
        }
      });
    });
  }


  changePage(page: string) {
    this.state.currentPage = page;
    this.render();
  }


}
