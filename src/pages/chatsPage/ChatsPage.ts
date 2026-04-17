import Block from "../../framework/Block";

export class ChatsPage extends Block {
  static componentName = "ChatsPage";
  protected template = `<main class="messenger">
  <div class="chats">
    <form class="chats__header">
      <a href='/settings'>Профиль &gt;</a>
      <input type="text" placeholder="Поиск"/>
    </form>
    <section class="chats__cards">
      {{#each mockContacts}}
       {{{ChatsCard avatar=avatar name=name lastMessage=lastMessage lastMessageTime=lastMessageTime unreadCount=unreadCount}}}
      {{/each}}
    </section>
  </div>
  <div class="messages">
    <div class="messages__header">
       <img src={{mockData.avatar}} alt="Avatar" class="messages__avatar">
       <p>{{mockData.name}}</p>
       <img src="../../../public/Group 194.svg" alt="More" class="messages__more">
    </div>
    <section class="messages__cards ">
      {{#each mockMessages}}
        {{{MessagesCard senderId=senderId text=text time=time}}}
      {{/each}}
    </section>
    <form class="messages__write">
      <input type="file" id="file-box" class="messages__file-box">
      <label for="file-box" class="messages__file-label">
              <img src="../../../public/Group 196.svg" alt="Загрузить файл" >
      </label>
      <div class="messages__form">
      <input type="text" placeholder="Сообщение" class="messages__box">
      <button class="messages__button" type="submit"><img src="../../../public/Group 202.svg" class="messages__enter" alt="Отправить"></button>    
      </div>  
    </form>
  </div>
</main>
`;
}
