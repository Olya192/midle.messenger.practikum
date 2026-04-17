import { InputProfile } from "../../components/input/InputProfile";
import Block from "../../framework/Block";
import type { RedactProfilePageeProps } from "../../types/type";

export class RedactProfilePagee extends Block<RedactProfilePageeProps> {
  static componentName = "RedactProfilePagee";

  protected template = `<main class="profile">
    {{{ButtonBack}}}    
    <div class="profile__container">
      <div class="profile__main">
        <div class="profile__image">
          <img src="../../../public/Union.svg">  
        </div>          
        <p class="profile__name">{{userName}}</p>
      </div> 
      <form class="profile__form">
       <div class="profile__redact-cards">
        {{#each redactData}}
          {{{InputProfile type=this.type name=this.name text=this.text label=this.label ref=this.ref}}}
        {{/each}} 
       </div>
       <div class="profile__button-redact">
        {{{ButtonForm button='Сохранить'}}}
       </div>
      </form>
    </div> 
    {{{Footer}}}
  </main>`;

  private inputFields: Map<string, InputProfile> = new Map();

  constructor(props: RedactProfilePageeProps) {
    super(props);
  }

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

      if (component instanceof InputProfile) {
        const name = component.getName(); // Используем публичный метод
        if (name) {
          this.inputFields.set(name, component);
        }
      }
    });
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
