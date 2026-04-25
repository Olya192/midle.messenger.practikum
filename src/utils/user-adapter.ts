import type { Profile, Redact } from "../mock/profile";

export interface UserFromAPI {
  avatar: string | null;
  display_name: string | null;
  email: string;
  first_name: string;
  id: number;
  login: string;
  phone: string;
  second_name: string;
}

// Функция для преобразования данных из API в формат Profile[]
export function adaptUserToProfile(user: UserFromAPI): Profile[] {
  return [
    { title: "Почта", text: user.email },
    { title: "Логин", text: user.login },
    { title: "Имя", text: user.first_name },
    { title: "Фамилия", text: user.second_name },
    { title: "Имя в чате", text: user.display_name || user.first_name },
    { title: "Телефон", text: user.phone },
  ];
}

// Функция для преобразования данных из API в формат Redact[]
export function adaptUserToProfileRedact(user: UserFromAPI): Redact[] {
  return [
    { label: "Почта", text: user.email, type: "email", name: "email", ref: "email" },
    { label: "Логин", text: user.login, type: "text", name: "login", ref: "login" },
    { label: "Имя", text: user.first_name, type: "text", name: "first_name", ref: "first_name" },
    { label: "Фамилия", text: user.second_name, type: "text", name: "second_name", ref: "second_name" },
    { label: "Имя в чате", text: user.display_name || user.first_name, type: "text", name: "nick", ref: "nick" },
    { label: "Телефон", text: user.phone, type: "tel", name: "phone", ref: "phone" },
  ];
}
