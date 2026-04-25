import Block from "../../framework/Block";
import { getRouter } from "../../utils/navigation";

export class ButtonBack extends Block {
  static componentName = "ButtonBack";
  protected template = ` 
  <button class="button-back" id='button-back'>
  <img src="../../../public/Group 202.svg" alt="Назад к чатам" class="button-back__image"/>
</button>`;

  protected events = {
    click: (e: Event) => {
      const target = e.target as HTMLElement;
      const id = target?.id;
      const router = getRouter();

      switch (id) {
        case "button-back":
          router.back();
          break;

        default:
          break;
      }
    },
  };
}
