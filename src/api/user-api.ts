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
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
}

const userAPIInstance = new HTTPTransport({
  baseURL: "https://ya-praktikum.tech/api/v2",
  defaultCredentials: "include",
  defaultHeaders: {
    "Content-Type": "application/json",
  },
  defaultTimeout: 10000,
});

// Создаем отдельный экземпляр для загрузки файлов (без Content-Type)
const avatarAPIInstance = new HTTPTransport({
  baseURL: "https://ya-praktikum.tech/api/v2",
  defaultCredentials: "include",
  defaultHeaders: {}, // Пустые заголовки по умолчанию
  defaultTimeout: 10000,
});

export class UserAPI  extends BaseAPI {
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

  // Новый метод для загрузки аватара
  async changeAvatar(avatarFile: File): Promise<UserData> {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    // Используем avatarAPIInstance без Content-Type заголовка
    const response = await avatarAPIInstance.put<UserData>(
      "/user/profile/avatar",
      {
        data: formData,
        headers: {
          // Не устанавливаем Content-Type - браузер сам установит multipart/form-data с boundary
        },
      },
    );

    // Обновляем стор с новыми данными пользователя
    Store.setUser(response);
    return response;
  }
}
