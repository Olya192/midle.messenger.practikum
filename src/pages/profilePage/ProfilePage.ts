import Block from "../../framework/Block";

export class ProfilePage extends Block {
  static componentName = "ProfilePage";
  protected template = `<<main class="profile">
      {{{ButtonBack}}}  
    <div class="profile__container">
       <div class="profile__main">
          <div class="profile__image">
              <label for="avatar" class="profile__image-label">
                <img src="../../../public/Union.svg" alt="Загрузить аватар">
              </label>
              <input type="file" name="avatar" id="avatar" class="profile__input" accept="image/*" hidden>
            </div>          
         <p class="profile__name">Иван</p>
        </div> 
        <div class="profile__inform-cards">
           {{#each profile}}
           {{{InformCard title=title text=text}}}
            {{/each}} 
        </div>
        <div class="profile__buttons">
          <a href="#" class="profile__button-activ">Изменить данные</a>
          <a href="#" class="profile__button-activ">Изменить пароль</a>
          <a href="#" class="profile__button-exit">Выйти</a> 
         </div>
     </div> 
     {{{Footer}}}
</main>
`;
}
