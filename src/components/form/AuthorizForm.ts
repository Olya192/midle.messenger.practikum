import { AuthAPI } from "../../api/auth-api";
import Block from "../../framework/Block";
import Store from "../../store/Store";
import type { AuthorizFormProps } from "../../types/type";
import { getRouter } from "../../utils/navigation";
import { InputForm } from "../input/InputForm";

export class AuthorizForm extends Block<AuthorizFormProps> {
  static componentName = "AuthorizForm";
  protected template = `<div class="main">
 <h1 class="main__title">Вход</h1>
    <form action="" method="get" class="main-form" id="auth-form">
      {{#each authorization.input}}
        {{{InputForm type=this.type name=this.name ref=this.ref label=this.label}}}
      {{/each}}
      <div class="main-form__button-box">
        {{{ButtonForm button=authorization.button navigateTo="/chats"}}}
        <p class="main-form__link" id='link'>Нет аккаунта?</p>
      </div>
    </form>
  </div>`;

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
          router.go("/sign-up");
          break;

        default:
          break;
      }
    },
  };

  protected componentDidMount(): void {
    super.componentDidMount();

    this.collectInputFields();

    const form = this.element()?.querySelector("#auth-form");
    if (form) {
      form.addEventListener("submit", this.handleSubmit.bind(this));
    }
  }

  private collectInputFields(): void {
    this.props.__children?.forEach((child) => {
      const component = child.component;
      if (component instanceof InputForm) {
        const name = component.getName();
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

    this.inputFields.forEach((field, name) => {
      const fieldIsValid = field.validate();
      if (!fieldIsValid) {
        isValid = false;
      }
      formData[name] = field.getValue();
    });

    if (isValid) {
      const authAPI = new AuthAPI();
      const body = { login: formData.login, password: formData.password };
      const responseAuth = await authAPI.signin(body);
      const router = getRouter();
      if (responseAuth) {
        const user = Store.getUser();
        console.log("user", user);
        router.go("/messenger");
      }
    } else {
      console.log("Форма содержит ошибки, исправьте их перед отправкой");
    }
  }

  validateForm(): boolean {
    let isValid = true;
    this.inputFields.forEach((field) => {
      if (!field.validate()) {
        isValid = false;
      }
    });
    return isValid;
  }

  getFormData(): Record<string, string> {
    const formData: Record<string, string> = {};
    this.inputFields.forEach((field, name) => {
      formData[name] = field.getValue();
    });
    return formData;
  }

  clearAllErrors(): void {
    this.inputFields.forEach((field) => {
      field.clearError();
    });
  }

  protected componentWillUnmount(): void {
    const form = this.element()?.querySelector("#auth-form");
    if (form) {
      form.removeEventListener("submit", this.handleSubmit.bind(this));
    }
    super.componentWillUnmount();
  }
}
