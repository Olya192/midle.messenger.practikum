import Handlebars from "handlebars";
import type {
  BaseProps,
  Chat,
  DeepClean,
  FieldType,
  Message,
} from "../types/type";
import type { AuthService } from "../mock/authorization";
import type { Contacts, Messages, MockData } from "../mock/chats";
import type { Profile, Redact } from "../mock/profile";

export interface BlockOwnProps extends BaseProps {
  __children?: Array<{
    component: Block<object>;
    embed(node: DocumentFragment): void;
  }>;
  __refs?: Record<string, Element>;
  error?: string;
  name?: string;
  ref?: string;
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
  inputContent?: string;
  userName?: string;
  profileRedact?: Redact[];
  passwordRedact?: Redact[];
  avatarUrl?: string;
  chats?: Chat[];
  selectedChat?: Chat;
  messages?: Message[];
  currentChatAvatar?: string;
  currentChatTitle?: string;
  onChatClick?: (chatId: number) => void;
  attachEvents?: (data: any) => void;
}

type EventListType = Partial<
  Record<keyof HTMLBodyElementEventMap, (e: Event) => void>
>;

export default abstract class Block<
  Props extends BlockOwnProps = BlockOwnProps,
> {
  protected abstract template: string;

  static componentName: string;

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
    const oldProps = { ...this.props };
    this.props = { ...this.props, ...props } as Props;

    // Добавляем проверку, действительно ли изменились props
    if (this.shouldUpdate(oldProps, this.props)) {
      this.render();
    }
  }

  protected shouldUpdate(oldProps: Props, newProps: Props): boolean {
    // Исключаем служебные поля из сравнения
    const excludeKeys = ["__children", "__refs"];

    // Собираем все ключи из обоих объектов
    const allKeys = new Set([
      ...Object.keys(oldProps).filter((key) => !excludeKeys.includes(key)),
      ...Object.keys(newProps).filter((key) => !excludeKeys.includes(key)),
    ]);

    // Сравниваем значения
    for (const key of allKeys) {
      const oldValue = oldProps[key as keyof Props];
      const newValue = newProps[key as keyof Props];

      if (oldValue !== newValue) {
        return true;
      }
    }
    return false;
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
    // Сохраняем старый DOM элемент
    const oldElement = this.domElement;

    this.unmountComponent();

    // Очищаем детей

    this.children = [];
    this.refs = {};

    const fragment = this.compile();
    console.log("console.log(fragment);", fragment);
    if (fragment) {
      if (oldElement && oldElement.parentNode) {
        // Заменяем старый элемент новым
        oldElement.replaceWith(fragment);
        this.domElement = fragment; // ВАЖНО: обновляем domElement
      } else if (this.domElement && this.domElement.parentNode) {
        this.domElement.replaceWith(fragment);
        this.domElement = fragment; // ВАЖНО: обновляем domElement
      } else {
        this.domElement = fragment; // ВАЖНО: устанавливаем domElement
      }
    }

    this.mountComponent();
  }

  protected compile(): Element | null {
    // Создаем безопасную копию props для Handlebars
    const html = Handlebars.compile(this.template)(this.props);
    const templateElement = document.createElement("template");
    templateElement.innerHTML = html;
    const fragment = templateElement.content;
    console.log("this.props.__children", this.props.__children);
    if (this.props.__children) {
      this.children = this.props.__children.map((child) => child.component);

      this.props.__children.forEach((child) => {
        child.embed(fragment);
      });
    }
    console.log("this.children", this.children);
    const defaultRefs = this.props.__refs ?? {};

    this.refs = Array.from(fragment.querySelectorAll("[ref]")).reduce(
      (list, element) => {
        const key = element.getAttribute("ref") as string;
        list[key] = element as HTMLElement;
        element.removeAttribute("ref");
        return list;
      },
      defaultRefs as Record<string, Element>,
    );

    if (this.props.attachEvents) {
      this.props.attachEvents(templateElement.content.firstElementChild);
    }

    return templateElement.content.firstElementChild;
  }

  private createSafeProps(): DeepClean<Props> {
    const safeProps = {} as DeepClean<Props>;
    console.log("this.props", this.props);
    for (const key in this.props) {
      const value = this.props[key];

      // Пропускаем функции
      if (typeof value === "function") {
        continue;
      }

      // Рекурсивно очищаем вложенные объекты
      if (value && typeof value === "object" && !Array.isArray(value)) {
        try {
          (safeProps as Record<string, unknown>)[key] = JSON.parse(
            JSON.stringify(value),
          );
        } catch {
          (safeProps as Record<string, unknown>)[key] = {};
        }
      } else if (Array.isArray(value)) {
        try {
          (safeProps as Record<string, unknown>)[key] = JSON.parse(
            JSON.stringify(value),
          );
        } catch {
          (safeProps as Record<string, unknown>)[key] = [];
        }
      } else {
        (safeProps as Record<string, unknown>)[key] = value;
      }
    }
    console.log("this.safeProps", safeProps);
    return safeProps;
  }
}
