import Block from "../../framework/Block";

export class ChatsCard extends Block {
  static componentName = "ChatsCard";
  protected template = `<div class="chats__card">
  <img src={{avatar}} alt="аватар" />
  <div class="chats__info">
    <p class="chats__name">{{name}}</p>
    <p class="chats__text" >{{lastMessage}}</p>
  </div>
  <div class="chats__item">
    <p class="chats__time">{{lastMessageTime}}</p>
    <div class="chats__lot {{#if (eq unreadCount 0)}} chats__lot--off{{/if}}">{{unreadCount}}</div>
  </div>
</div>`;
}
