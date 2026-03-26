import Block from "../../framework/Block";

export class MessagesCard extends Block {
  static componentName = "MessagesCard";
  protected template = `<div class="messages__card {{#if (eq senderId "me")}} messages__card--me{{/if}}" >
    <p class="messages__text">{{text}}</p>
    <p class="messages__time ">{{time}}</p>
</div>`;
}
