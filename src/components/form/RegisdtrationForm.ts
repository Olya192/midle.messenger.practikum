import { AuthAPI, type SignUpRequest } from "../../api/auth-api";
import Block from "../../framework/Block";
import type { AuthorizFormProps } from "../../types/type";
import { getRouter } from "../../utils/navigation";
import { InputForm } from "../input/InputForm";

export class RegisdtrationForm extends Block<AuthorizFormProps> {
  static componentName = "RegisdtrationForm";
  protected template = `<div class="main">
  <h1 class="main__title">Вход</h1>
  <form action="" method="get" class="main-form" id="auth-form">
{{#each registration.input}}
{{{InputForm type=this.type name=this.name ref=this.ref label=this.label}}}
    {{/each}}
    <div class="main-form__button-box">
      {{ButtonForm  button=registration.button}}
    <p class="main-form__link" id='link'>Войти</p>
    </div>
  </form>
</div>
`;

  private inputFields: Map<string, InputForm> = new Map();

  constructor(props: AuthorizFormProps) {
    super(props);
  }

  protected events = {
    click: (e: Event) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      const id = target?.id;
      const router = getRouter();

      switch (id) {
        case "link":
          router.back();
          break;

        default:
          break;
      }
    },
  };

  protected componentDidMount(): void {
    super.componentDidMount();

    // Собираем все экземпляры InputForm в Map для удобного доступа
    this.collectInputFields();

    // Добавляем обработчик отправки формы
    const form = this.element()?.querySelector("#auth-form");
    if (form) {
      form.addEventListener("submit", this.handleSubmit.bind(this));
    }
  }

  // Собираем все поля формы из __children
  private collectInputFields(): void {
    this.props.__children?.forEach((child) => {
      const component = child.component;

      if (component instanceof InputForm) {
        const name = component.getName(); // Используем публичный метод
        if (name) {
          this.inputFields.set(name, component);
        }
      }
    });
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    let isValid = true;
    const formData: Record<string, string> = {};

    // Валидируем все поля
    this.inputFields.forEach((field, name) => {
      const fieldIsValid = field.validate();
      if (!fieldIsValid) {
        isValid = false;
      }
      formData[name] = field.getValue();
    });

    // Добавить проверку совпадения паролей
    const passwordsMatch = this.validatePasswordMatch();
    if (!passwordsMatch) {
      isValid = false;
    }

    if (isValid) {
      const authAPI = new AuthAPI();
      const body: SignUpRequest = {
        first_name: formData.first_name,
        second_name: formData.second_name,
        login: formData.login,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      };
      const response = await authAPI.signup(body);
      if (response) {
        const router = getRouter();
        router.go("/messenger");
      }
    } else {
      console.log("Форма содержит ошибки, исправьте их перед отправкой");
    }
  }

  // Публичный метод для ручной валидации формы
  validateForm(): boolean {
    let isValid = true;
    this.inputFields.forEach((field) => {
      if (!field.validate()) {
        isValid = false;
      }
    });
    return isValid;
  }

  // Публичный метод для получения данных формы
  getFormData(): Record<string, string> {
    const formData: Record<string, string> = {};
    this.inputFields.forEach((field, name) => {
      formData[name] = field.getValue();
    });
    return formData;
  }

  // Публичный метод для очистки всех ошибок
  clearAllErrors(): void {
    this.inputFields.forEach((field) => {
      field.clearError();
    });
  }

  private validatePasswordMatch(): boolean {
    const passwordField = this.inputFields.get("password");
    const confirmPasswordField = this.inputFields.get("tow-password");

    if (passwordField && confirmPasswordField) {
      const password = passwordField.getValue();
      const confirmPassword = confirmPasswordField.getValue();

      if (password !== confirmPassword) {
        // Показываем ошибку под полем подтверждения пароля
        confirmPasswordField.showCustomError("Пароли не совпадают");
        return false;
      }
    }
    return true;
  }

  protected componentWillUnmount(): void {
    const form = this.element()?.querySelector("#auth-form");
    if (form) {
      form.removeEventListener("submit", this.handleSubmit.bind(this));
    }
    super.componentWillUnmount();
  }
}
