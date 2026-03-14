interface Profile {
  title: string;
  text: string;
}

interface Redact {
  label: string;
  text: string;
  type: string;
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
  },
  {
    label: "Логин",
    text: "ivanivanov",
    type: "text",
  },
  {
    label: "Имя",
    text: "Иван",
    type: "text",
  },
  {
    label: "Фамилия",
    text: "Иванов",
    type: "text",
  },
  {
    label: "Имя в чате",
    text: "Иван",
    type: "text",
  },
  {
    label: "Телефон",
    text: "+7(909)9673030",
    type: "tel",
  },
];

export const passwordRedact: Redact[] = [
  {
    label: "Старый пароль",
    text: "ggeejkmdfhgg",
    type: "password",
  },
  {
    label: "Новый пароль",
    text: "Новый пароль",
    type: "password",
  },
  {
    label: "Повторите новый пароль",
    text: "Новый пароль",
    type: "password",
  },
];
