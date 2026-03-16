export interface AuthService {
  button: string;
  link: string;
  input: {
    label: string;
    type: string;
    name: string;
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
    },
    {
      label: "Пароль",
      type: "password",
      name: "password",
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
    },
    {
      label: "Логин",
      type: "text",
      name: "login",
    },
    {
      label: "Имя",
      type: "text",
      name: "first_name",
    },
    {
      label: "Фамилия",
      type: "text",
      name: "second_name",
    },
    {
      label: "Телефон",
      type: "tel",
      name: "phone",
    },
    {
      label: "Пароль",
      type: "password",
      name: "password",
    },
    {
      label: "Пароль (ещё раз)",
      type: "password",
      name: "tow-password",
    },
  ],
};
