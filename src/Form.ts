import Block from "./framework/Block";
import type { BlockOwnProps } from "./framework/Block";
import { registerComponent } from "./framework/ComponentRegistry";
import { authorization, type AuthService } from "./mock/authorization";
import { AutorizationPage } from "./pages/autorizationPage/autorizationPage";
import { ButtonForm } from "./components/button/ButtonForm";
import { Link } from "./components/link/Link";
import { InputForm } from "./components/input/InputForm";

import "./styles/styles.pcss";
import { Footer } from "./components/footer/Footer";

interface FormProps extends BlockOwnProps {
  buttonName?: string;
  authorization?: AuthService;
}

// class Button extends Block {
//   static componentName = "Button";
//   protected template = `<button>{{buttonName}}</button>`;
// }

// class Input extends Block<FormProps> {
//   static componentName = "Input";
//   protected template = `<input type="{{ type }}" placeholder="{{ placeholder }}" ref="input" id={{ref}}>`;
// }

// registerComponent(Button);
// registerComponent(Input);

registerComponent(AutorizationPage);
registerComponent(InputForm);
registerComponent(ButtonForm);
registerComponent(Link);
registerComponent(Footer);

export default class Form extends Block<FormProps> {
  constructor() {
    super({
      authorization: authorization  // Передаем через пропсы
    });
  }

  protected template = `{{{ AutorizationPage authorization=authorization}}}`;

  protected events = {
    submit: (event: Event) => {
      event.preventDefault();
      console.log(this.refs);
      console.log((this.refs.password as HTMLInputElement).value);
    },
  };

  protected componentDidMount() {
    console.log("form component mounted");    
  }
}
