import Block from "../../framework/Block";

export class Link extends Block {
  static componentName = "Link";
  protected template = `<a href={{href}} class="main-form__link">{{link}}</a>`;
}
