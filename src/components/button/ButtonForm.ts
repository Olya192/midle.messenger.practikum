import Block from "../../framework/Block";

export class ButtonForm extends Block {
  static componentName = "ButtonForm";
  protected template = `<button type="submit" class="main-form__button" >{{button}}</button>`;
}
