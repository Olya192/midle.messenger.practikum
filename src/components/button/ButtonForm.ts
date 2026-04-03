import Block from "../../framework/Block";
import type { ButtonFormProps } from "../../types/type";

export class ButtonForm extends Block<ButtonFormProps> {
  static componentName = "ButtonForm";
  protected template = `<button type="submit" class="main-form__button" >{{button}}</button>`;
}
