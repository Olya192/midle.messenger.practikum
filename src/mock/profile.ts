import type { FieldType } from "../types/type";

export interface Profile {
  title: string;
  text: string;
}

export interface Redact {
  type: FieldType;
  name: string;
  value?: string;
  label: string;
  ref: string;
  disabled?: boolean;
  text: string;
}

export const profile: Profile[] = [
  {
    title: "Почта",
    text: "pochta@yandex.ru",
  },
  {
    title: "Логин",
    text: "ivanivanov",
  },
  {
    title: "Имя",
    text: "Иван",
  },
  {
    title: "Фамилия",
    text: "Иванов",
  },
  {
    title: "Имя в чате",
    text: "Иван",
  },
  {
    title: "Телефон",
    text: "+7 (909) 967 30 30",
  },
];

export const profileRedact: Redact[] = [
  {
    label: "Почта",
    text: "pochta@yandex.ru",
    type: "email",
    name: "email",
    ref: "email",
  },
  {
    label: "Логин",
    text: "ivanivanov",
    type: "text",
    name: "login",
    ref: "login",
  },
  {
    label: "Имя",
    text: "Иван",
    type: "text",
    name: "first_name",
    ref: "first_name",
  },
  {
    label: "Фамилия",
    text: "Иванов",
    type: "text",
    name: "second_name",
    ref: "second_name",
  },
  {
    label: "Имя в чате",
    text: "Иван",
    type: "text",
    name: "nick",
    ref: "nick",
  },
  {
    label: "Телефон",
    text: "+7(909)9673030",
    type: "tel",
    name: "phone",
    ref: "phone",
  },
];

export const passwordRedact: Redact[] = [
  {
    label: "Старый пароль",
    text: "ggeejkmdfhgg",
    type: "password",
    name: "old_password",
    ref: "old_password",
  },
  {
    label: "Новый пароль",
    text: "Новый пароль",
    type: "password",
    name: "new_password",
    ref: "new_password",
  },
  {
    label: "Повторите новый пароль",
    text: "Новый пароль",
    type: "password",
    name: "new_password2",
    ref: "new_password2",
  },
];
