import Block from "../../framework/Block";

export class Error404 extends Block {
  static componentName = "Error404";
  protected template = `<main class="error">
  <h1>404</h1>
  <h2>Не туда попали</h2>
  <a href="/messenger">Назад к чатам</a>
</main>
`;
}
