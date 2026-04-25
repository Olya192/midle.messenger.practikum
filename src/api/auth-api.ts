import { BaseAPI } from "../modules/http/base-api";
import HTTPTransport from "../modules/HTTPTransport";
import Store from "../store/Store";
import { getRouter } from "../utils/navigation";
import { ChatAPI } from "./chat-api";

export interface SignUpRequest {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
}

interface SignUpResponse {
  id: number;
}

interface UserData {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
}

// Теперь передаем только эндпоинт (пустая строка, так как будем использовать полные пути)
const authAPIInstance = new HTTPTransport({
  defaultCredentials: "include",
  defaultHeaders: {
    "Content-Type": "application/json",
  },
  defaultTimeout: 10000,
});

export class AuthAPI extends BaseAPI {
  signup(userData: SignUpRequest): Promise<SignUpResponse> {
    return authAPIInstance
      .post<SignUpResponse>("/auth/signup", {
        data: userData,
      })
      .then((response) => {
        return this.getUser().then((userData) => {
          Store.setState("user", userData);
          Store.setState("isAuthenticated", true);
          localStorage.setItem("user", "user");
          return response;
        });
      })
      .catch((error) => {
        Store.setState("user", null);
        Store.setState("isAuthenticated", false);
        throw error;
      });
  }

  signin(loginData: { login: string; password: string }) {
    return authAPIInstance
      .post("/auth/signin", {
        data: loginData,
      })
      .then(() => {
        return this.getUser().then((userData) => {
          Store.setState("user", userData);
          Store.setState("isAuthenticated", true);
          this.loadInitialChats();
          localStorage.setItem("user", "user");
          return userData;
        });
      })
      .catch((error) => {
        const router = getRouter();
          if (error?.response?.includes("User already in system")) {
          localStorage.setItem("user", "user");
          router.go("/messenger");
          return;
        }
        throw error;
      });
  }

  private async loadInitialChats() {
    try {
      const chatAPI = new ChatAPI();
      const chats = await chatAPI.getChats({ offset: 0, limit: 100 });
      Store.setState("chats", chats);
    } catch (error) {
      console.error("Ошибка при загрузке чатов после авторизации:", error);
    }
  }

  logout() {
    return authAPIInstance.post("/auth/logout").then(() => {
      Store.setState("user", null);
      Store.setState("isAuthenticated", false);
      localStorage.clear();
    });
  }

  getUser(): Promise<UserData> {
    return authAPIInstance.get("/auth/user");
  }

  async refreshUserData(): Promise<UserData> {
    const userData = await this.getUser();
    Store.setState("user", userData);
    Store.setState("isAuthenticated", true);
    return userData;
  }

  create(data: SignUpRequest) {
    return this.signup(data);
  }

  request() {
    return this.getUser();
  }

  update() {
    throw new Error("Method not implemented");
  }

  delete() {
    throw new Error("Method not implemented");
  }
}
