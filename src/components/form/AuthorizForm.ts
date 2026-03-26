import Block from "../../framework/Block";
import { InputForm } from "../input/InputForm";

export class AuthorizForm extends Block {
  static componentName = "AuthorizForm";
  protected template = `<div class="main">
 <h1 class="main__title">Вход</h1>
    <form action="" method="get" class="main-form" id="auth-form">
      {{#each authorization.input}}
        {{{InputForm type=this.type name=this.name ref=this.ref label=this.label}}}
      {{/each}}
      <div class="main-form__button-box">
        {{{ButtonForm button=authorization.button}}}
        {{{Link link=authorization.link}}}
      </div>
    </form>
  </div>`;
  
  private inputFields: Map<string, InputForm> = new Map();

  constructor(props: any = {}) {
    super(props);
  }

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
    if (this.props.__children) {
      this.props.__children.forEach((child: any) => {
        if (child.component instanceof InputForm) {
          const name = child.component.props.name;
          if (name) {
            this.inputFields.set(name, child.component);
          }
        }
      });
    }
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();

    let isValid = true;
    const formData: Record<string, string> = {};

    // Валидируем все поля и собираем данные
    this.inputFields.forEach((field, name) => {
      const fieldIsValid = field.validate();
      if (!fieldIsValid) {
        isValid = false;
      }
      formData[name] = field.getValue();
    });

    if (isValid) {
      // Выводим в консоль объект со всеми заполненными полями
      console.log("Данные формы:", formData);
      console.log("Все заполненные поля:", JSON.stringify(formData, null, 2));

      // Здесь можно отправить данные на сервер
      // this.submitForm(formData);
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

  protected componentWillUnmount(): void {
    const form = this.element()?.querySelector("#auth-form");
    if (form) {
      form.removeEventListener("submit", this.handleSubmit.bind(this));
    }
    super.componentWillUnmount();
  }
}
