import Block from "../../framework/Block";

export class Footer extends Block {
  static componentName = "Footer";
  protected template = `<footer>
  <a href="#" data-page="authPage" class="navigation">авторизация</a>
  <a href="#" data-page="registrPage" class="navigation">регистрация</a>
  <a href="#" data-page="chatsPage" class="navigation">мессенджер</a>
  <a href="#" data-page="profilePage" class="navigation">личный кабинет</a>
  <a href="#" data-page="redactProfilePage" class="navigation">редактор личных
    данных</a>
  <a href="#" data-page="redactProfilePagePass" class="navigation">редактор пароля</a>
  <a href="#" data-page="NotFoundErr" class="navigation">ошибка 404</a>
  <a href="#" data-page="ServerError" class="navigation">ошибка 500</a>
</footer>`;
}
