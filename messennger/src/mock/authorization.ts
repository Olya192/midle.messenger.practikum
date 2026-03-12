export interface AuthService {
  button: string;
  link: string;
  input: {
    label: string;
    type: string;
  }[];
}

export const authorization: AuthService = {
  button: "Авторизоваться",
  link: "Нет аккаунта?",
  input: [
    {
      label: "Логин",
      type: "text",
    },
    {
      label: "Пароль",
      type: "password",
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
    },
    {
      label: "Логин",
      type: "text",
    },
    {
      label: "Имя",
      type: "text",
    },
    {
      label: "Фамилия",
      type: "text",
    },
    {
      label: "Телефон",
      type: "tel",
    },
    {
      label: "Пароль",
      type: "password",
    },
    {
      label: "Пароль (ещё раз)",
      type: "password",
    },
  ],
};
