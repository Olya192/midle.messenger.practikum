import type { BlockOwnProps } from "../framework/Block";
import type Block from "../framework/Block";
import type { AuthService } from "../mock/authorization";

export type FieldType = "text" | "password" | "email" | "tel" | "number";

export type ValidationResult = string;
export type ValidationFunction = (value: string) => ValidationResult;

// Базовые пропсы для всех компонентов
export interface BaseProps {
  __children?: Array<{
    component: Block<BaseProps>; // Используем BaseProps вместо object
    embed(node: DocumentFragment): void;
  }>;
  __refs?: Record<string, Element>;
  className?: string;
  id?: string;
}

// Пропсы для Block (динамические ключи)

// Пропсы для InputForm
export interface InputFormProps extends BlockOwnProps {
  type: FieldType;
  name: string;
  ref?: string;
  label: string;
  value?: string;
  disabled?: boolean;
  error?: string;
}

// Пропсы для ButtonForm
export interface ButtonFormProps extends BlockOwnProps {
  button: string;
  type?: "submit" | "button" | "reset";
  onClick?: (event: Event) => void;
  navigateTo?: string;
}

// Пропсы для AuthorizForm
export interface AuthorizFormProps extends BlockOwnProps {
  authorization:
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
  onSubmit?: (data: Record<string, string>) => void;
}


// Пропсы для Link
export interface LinkProps extends BlockOwnProps {
  link: {
    text: string;
    href: string;
  };
}

// Пропсы для ButtonBack
export interface ButtonBackProps extends BlockOwnProps {
  onClick?: (event: Event) => void;
}

export type RouteProps = {
  rootQuery: string;
};

export type RouteCallback<P extends BlockOwnProps = BlockOwnProps> = (
  props?: P,
) => Block<P>;

export type RouteConfig<P extends BlockOwnProps = BlockOwnProps> = {
  pathname: string;
  view: typeof Block<P> | RouteCallback<P>;
  props: RouteProps;
};

export type NavigationOptions = {
  replace?: boolean;
  state?: Record<string, unknown>;
};

export type BlockConstructor<P extends BlockOwnProps = BlockOwnProps> = new (
  props: P,
) => Block<P>;

export type RouteView<P extends BlockOwnProps = BlockOwnProps> =
  | BlockConstructor<P>
  | (() => Block<P>);

// export type BlockFactory<P extends BlockOwnProps = BlockOwnProps> = (props?: Partial<P>) => Block<P>;

export type BlockFactory = () => Block<BlockOwnProps>;

export interface Chat {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  last_message: {
    user: {
      first_name: string;
      second_name: string;
      avatar: string;
      email: string;
      login: string;
      phone: string;
    };
    time: string;
    content: string;
  } | null;
}


export type DeepClean<T> = T extends (...args: unknown[]) => unknown
  ? never
  : T extends object
  ? { [K in keyof T]: DeepClean<T[K]> }
  : T;



export interface ProcessedChat extends Chat {
  lastMessageContent: string;
  lastMessageTime: string;
}


export interface ChatUser {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
}

export interface LastMessage {
  user: ChatUser;
  time: string;
  content: string;
}


export interface ProcessedChat extends Chat {
  lastMessageContent: string;
  lastMessageTime: string;
}

export interface Message {
  id: number;
  user_id: number;
  chat_id: number;
  time: string;
  type: string;
  content: string;
  file?: {
    id: number;
    user_id: number;
    path: string;
    filename: string;
    content_type: string;
    content_size: number;
    upload_date: string;
  } | null;
}

export interface SafeChat {
   id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  created_by: number;
  last_message: {
    user: {
      id: number;
      first_name: string;
      second_name: string;
      display_name: string;
      login: string;
      email: string;
      phone: string;
      avatar: string;
      role: string;
    };
    time: string;
    content: string;
  } | null;
}

export interface SafeMessage {
  id: number;
  senderId: number;
  text: string;
  time: string;
  chatId: number;
  type: string;
}

export interface DisplayChat extends Chat {
  lastMessageContent: string;
  lastMessageTime: string;
}

export interface DisplayMessage {
  id: number;
  senderId: number;
  text: string;
  time: string;
  chatId: number;
  type: string;
}

export interface ChatsPageProps extends BlockOwnProps {
  showAddChatModal?: boolean;
  onAddChat?: () => void;
  onCloseModal?: () => void;
  onChatCreated?: () => void;
  displayMessages?: DisplayMessage[];
  displayChats?: DisplayChat[];
  safeChats?: SafeChat[];
  safeMessages?: SafeMessage[];
  safeSelectedChat?: SafeChat;
  safeCurrentChatAvatar?: string;
  safeCurrentChatTitle?: string;
}



