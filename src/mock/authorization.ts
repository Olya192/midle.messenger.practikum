export interface AuthService {
  button: string;
  link: string;
  input: {
    label: string;
    type: string;
    name: string;
    ref: string;
  }[];
}

export const authorization: AuthService = {
  button: "Авторизоваться",
  link: "Нет аккаунта?",
  input: [
    {
      label: "Логин",
      type: "text",
      name: "login",
      ref: "login",
    },
    {
      label: "Пароль",
      type: "password",
      name: "password",
      ref: "password",
    },
  ],
};

export const registration: AuthService = {
  button: "Зарегистрироваться",
  link: "Войти",
  input: [
    {
      label: "Почта",
      type: "email",
      name: "email",
      ref: "email",
    },
    {
      label: "Логин",
      type: "text",
      name: "login",
      ref: "login",
    },
    {
      label: "Имя",
      type: "text",
      name: "first_name",
      ref: "first_name",
    },
    {
      label: "Фамилия",
      type: "text",
      name: "second_name",
      ref: "second_name",
    },
    {
      label: "Телефон",
      type: "tel",
      name: "phone",
      ref: "phone",
    },
    {
      label: "Пароль",
      type: "password",
      name: "password",
      ref: "password",
    },
    {
      label: "Пароль (ещё раз)",
      type: "password",
      name: "tow-password",
      ref: "tow-password",
    },
  ],
};
