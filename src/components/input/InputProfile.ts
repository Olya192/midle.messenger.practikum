import Block from "../../framework/Block";
import type { InputFormProps, ValidationResult } from "../../types/type";

export class InputProfile extends Block {
  static componentName = "InputProfile";
  protected template = `<div class="profile__input-box">
  <label for={{name}}>{{label}}</label>
  <input
    type={{type}}
    name={{name}}
    ref={{ref}}
    required
    value={{text}}
    id={{name}}
  />
  <div class="main-form__error-message" data-error="{{name}}"></div>
</div>`;

  constructor(props: InputFormProps) {
    super(props);
    // Инициализируем состояние ошибки
    this.props.error = "";
  }

  
    public getName(): string | undefined {
    return this.props.name;
  }

  // Метод валидации в зависимости от имени поля
  validateField(name: string, value: string): string {
    switch (name) {
      case "first_name":
      case "second_name":
        return this.validateName(value);
      case "login":
        return this.validateLogin(value);
      case "old_password":
      case "new_password":
      case "new_password2":
        return this.validatePassword(value);
      case "email":
        return this.validateEmail(value);
      case "phone":
        return this.validatePhone(value);
      default:
        return "";
    }
  }

  // Валидация имени (first_name, second_name)
  private validateName(value: string): ValidationResult {
    const pattern = /^[A-ZА-ЯЁ][a-zа-яё]*(?:-[A-ZА-ЯЁ][a-zа-яё]*)?$/;
    if (!value) {
      return "Поле обязательно для заполнения";
    }
    if (!pattern.test(value)) {
      return "Первая буква заглавная, только буквы (латиница или кириллица), допустим дефис";
    }
    return "";
  }

  // Валидация логина
  private validateLogin(value: string): ValidationResult {
    const pattern = /^(?=.*[a-zA-Z])[a-zA-Z0-9_-]{3,20}$/;
    if (!value) {
      return "Поле обязательно для заполнения";
    }
    if (value.length < 3 || value.length > 20) {
      return "Логин должен быть от 3 до 20 символов";
    }
    if (!pattern.test(value)) {
      return "Логин должен содержать латиницу, может содержать цифры, дефис и подчеркивание, но не состоять только из цифр";
    }
    return "";
  }

  // Валидация email
  private validateEmail(value: string): ValidationResult {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!value) {
      return "Поле обязательно для заполнения";
    }
    if (!pattern.test(value)) {
      return "Введите корректный email (латиница, цифры, @ и точка)";
    }
    return "";
  }

  // Валидация пароля
  private validatePassword(value: string): ValidationResult {
      if (!value) {
        return "Поле обязательно для заполнения";
      }
      if (value.length < 8 || value.length > 40) {
        return "Пароль должен быть от 8 до 40 символов";
      }
      const hasUpperCase = /[A-Z]/.test(value);
      const hasDigit = /[0-9]/.test(value);
      if (!hasUpperCase) {
        return "Пароль должен содержать минимум одну заглавную букву";
      }
      if (!hasDigit) {
        return "Пароль должен содержать минимум одну цифру";
      }
      return "";
    }

  // Валидация телефона
  private validatePhone(value: string): ValidationResult {
    const pattern = /^\+?\d{10,15}$/;
    if (!value) {
      return "Поле обязательно для заполнения";
    }
    if (!pattern.test(value)) {
      return "Телефон должен содержать 10-15 цифр, может начинаться с +";
    }
    return "";
  }

  // Получение элемента инпута по ref
  private getInputElement(): HTMLInputElement | null {
    const refName = this.props.ref;
    if (refName && this.refs[refName]) {
      return this.refs[refName] as HTMLInputElement;
    }
    return null;
  }

  // Получение элемента для отображения ошибки
  private getErrorElement(): HTMLElement | null {
    const element = this.element();
    if (!element) return null;

    const fieldName = this.props.name;
    return element.querySelector(`[data-error="${fieldName}"]`) as HTMLElement;
  }

  // Отображение ошибки
  private showError(errorMessage: string): void {
    const errorElement = this.getErrorElement();
    const inputElement = this.getInputElement();

    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.classList.add("visible");
    }

    if (inputElement) {
      inputElement.classList.add("err");
    }

    // Сохраняем ошибку в пропсы
    this.props.error = errorMessage;
  }

  // Скрытие ошибки
  private hideError(): void {
    const errorElement = this.getErrorElement();
    const inputElement = this.getInputElement();

    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("visible");
    }

    if (inputElement) {
      inputElement.classList.remove("err");
    }

    // Очищаем ошибку в пропсах
    this.props.error = "";
  }

  // Обработчик события blur
  private handleBlur = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const fieldName = this.props.name;
    const value = input.value;

    if (fieldName) {
      const errorMessage = this.validateField(fieldName, value);
      if (errorMessage) {
        this.showError(errorMessage);
      } else {
        this.hideError();
      }
    }
  };

  // Публичный метод для получения значения поля
  getValue(): string {
    const input = this.getInputElement();
    return input ? input.value : "";
  }

  // Публичный метод для установки значения поля
  setValue(value: string): void {
    const input = this.getInputElement();
    if (input) {
      input.value = value;
    }
  }

  // Публичный метод для валидации поля
  validate(): boolean {
    const fieldName = this.props.name;
    const value = this.getValue();

    if (fieldName) {
      const errorMessage = this.validateField(fieldName, value);
      if (errorMessage) {
        this.showError(errorMessage);
        return false;
      } else {
        this.hideError();
        return true;
      }
    }

    return true;
  }

  // Публичный метод для очистки ошибки
  clearError(): void {
    this.hideError();
  }

  // Метод для привязки событий
  private bindEvents(): void {
    const input = this.getInputElement();
    if (input) {
      input.addEventListener("blur", this.handleBlur);
    }
  }

  // Метод для отвязки событий
  private unbindEvents(): void {
    const input = this.getInputElement();
    if (input) {
      input.removeEventListener("blur", this.handleBlur);
    }
  }

  // Переопределяем метод componentDidMount для инициализации
  protected componentDidMount(): void {
    super.componentDidMount();
    this.bindEvents();
  }

  // Переопределяем метод componentWillUnmount для очистки
  protected componentWillUnmount(): void {
    this.unbindEvents();
    super.componentWillUnmount();
  }
}
