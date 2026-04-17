import HTTPTransport from "../modules/HTTPTransport";
import { BaseAPI } from "../modules/http/base-api";
import Store from "../store/Store";

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

const authAPIInstance = new HTTPTransport({
  baseURL: "https://ya-praktikum.tech/api/v2",
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
        // После успешной регистрации получаем данные пользователя
        return this.getUser().then((userData) => {
          // Сохраняем данные пользователя в стор
          Store.setState("user", userData);
          Store.setState("isAuthenticated", true);
          // Возвращаем ответ с id пользователя
          return response;
        });
      })
      .catch((error) => {
        // В случае ошибки очищаем данные пользователя
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
        // После успешного входа получаем данные пользователя
        return this.getUser().then((userData) => {
          // Сохраняем данные пользователя в стор
          Store.setState("user", userData);
          Store.setState("isAuthenticated", true);
          
          return userData;
        });
      })
      .catch((error) => {
        // В случае ошибки очищаем данные пользователя
        Store.setState("user", null);
        Store.setState("isAuthenticated", false);
        throw error;
      });
  }

  logout() {
    return authAPIInstance.post("/auth/logout").then(() => {
      // Очищаем стор при выходе
      Store.setState("user", null);
      Store.setState("isAuthenticated", false);
    });
  }

  getUser(): Promise<UserData> {
    return authAPIInstance.get("/auth/user");
  }

  // Метод для обновления данных пользователя в сторе
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
