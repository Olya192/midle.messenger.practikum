import Block from "../../framework/Block";

export class Error500 extends Block {
  static componentName = "Error500";
  protected template = `<main class="error">
  <h1>500</h1>
  <h2>Мы уже фиксим</h2>
  <a href="/messenger">Назад к чатам</a>
</main>`;

}
