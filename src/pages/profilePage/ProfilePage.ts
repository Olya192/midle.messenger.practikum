import Block from "../../framework/Block";

export class ProfilePage extends Block {
  static componentName = "ProfilePage";
  protected template = `<<main class="profile">
      {{{ButtonBack}}}  
    <div class="profile__container">
       <div class="profile__main">
          <div class="profile__image">
             <img src="../../../public/Union.svg">  
            </div>          
         <p class="profile__name">Иван</p>
        </div> 
        <div class="profile__inform-cards">
           {{#each profile}}
           {{{InformCard title=title text=text}}}
            {{/each}} 
        </div>
        <div class="profile__buttons">
          <a href="#" class="profile__button-activ">Изменить данные</p>
          <a href="#" class="profile__button-activ">Изменить пароль</p>
          <a href="#" class="profile__button-exit">Выйти</p> 
         </div>
     </div> 
     {{{Footer}}}
</main>
`;
}
