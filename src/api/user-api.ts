import { BaseAPI } from "../modules/http/base-api";
import HTTPTransport from "../modules/HTTPTransport";
import Store from "../store/Store";

export interface ChangeProfileRequest {
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
}

interface UserData {
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
}

const userAPIInstance = new HTTPTransport({
  baseURL: "https://ya-praktikum.tech/api/v2",
  defaultCredentials: "include",
  defaultHeaders: {
    "Content-Type": "application/json",
  },
  defaultTimeout: 10000,
});

export class UserAPI extends BaseAPI {
  changeProfile(userData: ChangeProfileRequest): Promise<UserData> {
    return userAPIInstance
      .put<UserData>("/user/profile", {
        data: userData,
      })
      .then((updatedUserData) => {
        // Обновляем стор с новыми данными
        Store.setState("user", updatedUserData);
        return updatedUserData;
      });
  }

  changePassword(passwordData: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> {
    return userAPIInstance.put("/user/password", {
      data: passwordData,
    });
  }

  getUserById(id: number): Promise<UserData> {
    return userAPIInstance.get(`/user/${id}`);
  }

  searchUsers(login: string): Promise<UserData[]> {
    return userAPIInstance.post("/user/search", {
      data: { login },
    });
  }
}
