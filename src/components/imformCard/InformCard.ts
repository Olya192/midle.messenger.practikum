import Block from "../../framework/Block";

export class InformCard extends Block {
  static componentName = "InformCard";
  protected template = `<div class="profile__card" id={{id}}>
    <p>{{title}}</p>
    <p>{{text}}</p>
</div>`;
}
