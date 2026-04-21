import Block from "../../framework/Block";
import type { ButtonFormProps } from "../../types/type";
import { getRouter } from "../../utils/navigation";



export class ButtonForm extends Block<ButtonFormProps> {
  static componentName = "ButtonForm";
  protected template = `<button type="submit" class="main-form__button" >{{button}}</button>`;

   constructor(props: ButtonFormProps) {
    super({
      type: "submit",
      ...props
    });
  }

  protected componentDidMount(): void {
    const button = this.element()?.querySelector("[data-button]");
    if (button) {
      button.addEventListener("click", this.handleClick.bind(this));
    }
  }

  private handleClick(event: Event): void {
    // Если есть кастомный обработчик, вызываем его
    if (this.props.onClick) {
      this.props.onClick(event);
    }
    
    // Если указан путь для навигации, используем роутер
    if (this.props.navigateTo) {
      event.preventDefault();
      const router = getRouter();
      router.go(this.props.navigateTo);
    }
  }

  protected componentWillUnmount(): void {
    const button = this.element()?.querySelector("[data-button]");
    if (button) {
      button.removeEventListener("click", this.handleClick.bind(this));
    }
  }

}
