import Handlebars from "handlebars";
import authorizForm from "./components/form/authorizForm.hbs?raw";
import authPage from "./pages/autorizationPage/autorizationPage.hbs?raw";
import buttonForm from "./components/button/button.hbs?raw";
import { authorization, registration } from "./mock/authorization.ts";
import inputForm from "./components/input/input.hbs?raw";
import regisdtrForm from "./components/form/regisdtrationForm.hbs?raw";
import registrPage from "./pages/regisdtrationPage/regisdtrationPage.hbs?raw";
import link from "./components/link/link.hbs?raw";
import buttonBack from "./components/button/buttonBack.hbs?raw";
import informCard from "./components/imformCard/informCard.hbs?raw";
import { profile, passwordRedact, profileRedact } from "./mock/profile.ts";
import profilePage from "./pages/profilePage/profilePage.hbs?raw";
import chatsPage from "./pages/chatsPage/chatsPage.hbs?raw";
import chatsCard from "./components/chatsCard/chatsCard.hbs?raw";
import { mockContacts, mockMessages, mockData } from "./mock/chats.ts";
import messageCard from "./components/messegCard/messegCard.hbs?raw";
import NotFoundErr from "./pages/errors/404errorPage.hbs?raw";
import ServerError from "./pages/errors/500errorPage.hbs?raw";
import Footer from "./components/footer/footer.hbs?raw";
import redactProfilePage from "../src/pages/profilePage/redactProfilePage.hbs?raw";
import inputProfile from "./components/input/inputProfile.hbs?raw";

import "./styles/styles.pcss";

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});
Handlebars.registerPartial("input-form", inputForm);
Handlebars.registerPartial("link", link);
Handlebars.registerPartial("button-back", buttonBack);
Handlebars.registerPartial("chats-card", chatsCard);
Handlebars.registerPartial("message-card", messageCard);
Handlebars.registerPartial("button-form", buttonForm);
Handlebars.registerPartial("inform-card", informCard);
Handlebars.registerPartial("auth-Form", authorizForm);
Handlebars.registerPartial("registr-Form", regisdtrForm);
Handlebars.registerPartial("input-profile", inputProfile);
Handlebars.registerPartial("footer", Footer);

export default class App {
  private state: { currentPage: string };
  private appElement: HTMLElement | null;

  constructor() {
    this.state = {
      currentPage: "redactProfilePage",
    };
    this.appElement = document.getElementById("app");
  }

  render() {
    if (!this.appElement) {
      console.error("App element not found");
      return;
    }
    let redactData;
    let template;
    if (this.state.currentPage === "authPage") {
      template = Handlebars.compile(authPage);
      this.appElement.innerHTML = template({ authorization });
    }
    if (this.state.currentPage === "registrPage") {
      template = Handlebars.compile(registrPage);
      this.appElement.innerHTML = template({ registration });
    }
    if (this.state.currentPage === "chatsPage") {
      template = Handlebars.compile(chatsPage);
      this.appElement.innerHTML = template({
        mockContacts,
        mockMessages,
        mockData,
      });
    }
    if (this.state.currentPage === "profilePage") {
      template = Handlebars.compile(profilePage);
      this.appElement.innerHTML = template({ profile });
    }
    if (this.state.currentPage === "NotFoundErr") {
      template = Handlebars.compile(NotFoundErr);
      this.appElement.innerHTML = template({});
    }
    if (this.state.currentPage === "ServerError") {
      template = Handlebars.compile(ServerError);
      this.appElement.innerHTML = template({});
    }
    if (this.state.currentPage === "redactProfilePage") {
      template = Handlebars.compile(redactProfilePage);
      redactData = profileRedact;
      this.appElement.innerHTML = template({ redactData });
    }
    if (this.state.currentPage === "redactProfilePagePass") {
      template = Handlebars.compile(redactProfilePage);
      redactData = passwordRedact;
      this.appElement.innerHTML = template({ redactData });
    }
    this.attachEventListener();
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

  changePage(page: any) {
    this.state.currentPage = page;
    this.render();
  }
}
