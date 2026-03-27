import Handlebars from "handlebars";
import type { BaseProps, FieldType } from "../types/type";
import type { AuthService } from "../mock/authorization";
import type { Contacts, Messages, MockData } from "../mock/chats";
import type { Profile } from "../mock/profile";

export interface BlockOwnProps extends BaseProps {
  __children?: Array<{
    component: Block<object>;
    embed(node: DocumentFragment): void;
  }>;
  __refs?: Record<string, Element>;
  error?: string;
  name?: string;
  ref?: HTMLElement | null;
  authorization?:
    | AuthService
    | {
        input: Array<{
          type: FieldType;
          name: string;
          ref: string;
          label: string;
        }>;
        button: string;
        link: {
          text: string;
          href: string;
        };
      };
  registration?: AuthService;
  mockContacts?: Contacts[];
  mockMessages?: Messages[];
  mockData?: MockData;
  profile?: Profile[];
}

type EventListType = Partial<
  Record<keyof HTMLBodyElementEventMap, (e: Event) => void>
>;

export default abstract class Block<
  Props extends BlockOwnProps = BlockOwnProps,
> {
  protected abstract template: string;

  protected props = {} as Props;

  private domElement: Element | null = null;

  protected children: Block<object>[] = [];

  protected refs: Record<string, Element> = {};

  protected events: EventListType = {};

  constructor(props: Props = {} as Props) {
    this.props = props;
  }

  public element(): Element | null {
    if (!this.domElement) {
      this.render();
    }
    return this.domElement;
  }

  public setProps(props: Partial<Props>) {
    this.props = { ...this.props, ...props } as Props;
    this.render();
  }

  protected componentWillUnmount() {}

  private unmountComponent() {
    if (this.domElement) {
      this.children.reverse().forEach((child) => child.unmountComponent());

      this.componentWillUnmount();
      this.removeListeners();
    }
  }

  private removeListeners() {
    for (const eventName in this.events) {
      const eventCallback = this.events[eventName as keyof EventListType];
      if (typeof eventCallback === "function" && this.domElement) {
        this.domElement.removeEventListener(eventName, eventCallback);
      }
    }
  }

  private attachListeners() {
    for (const eventName in this.events) {
      const eventCallback = this.events[eventName as keyof EventListType];
      if (typeof eventCallback == "function" && this.domElement) {
        this.domElement.addEventListener(eventName, eventCallback);
      }
    }
  }

  protected componentDidMount() {}

  private mountComponent() {
    this.attachListeners();
    this.componentDidMount();
  }

  protected render() {
    this.unmountComponent();
    const fragment = this.compile();
    if (this.domElement && fragment) {
      this.domElement.replaceWith(fragment);
    }
    this.domElement = fragment;
    this.mountComponent();
  }

  private compile(): Element | null {
    console.log("this.props", this.props);
    console.log("this.template", this.template);
    const html = Handlebars.compile(this.template)(this.props);
    const templateElement = document.createElement("template");
    templateElement.innerHTML = html;
    const fragment = templateElement.content;

    if (this.props.__children) {
      this.children = this.props.__children.map((child) => child.component);

      this.props.__children.forEach((child) => {
        child.embed(fragment);
      });
    }

    const defaultRefs = this.props.__refs ?? {};

    this.refs = Array.from(fragment.querySelectorAll("[ref]")).reduce(
      (list, element) => {
        const key = element.getAttribute("ref") as string;
        list[key] = element as HTMLElement;
        element.removeAttribute("ref");
        return list;
      },
      defaultRefs,
    );

    return templateElement.content.firstElementChild;
  }
}
