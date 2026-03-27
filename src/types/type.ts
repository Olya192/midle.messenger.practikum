import type Block from "../framework/Block";
import type { AuthService } from "../mock/authorization";

export type FieldType = 'text' | 'password' | 'email' | 'tel' | 'number';

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
export interface BlockOwnProps extends BaseProps {
  [key: string]: unknown;
}

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
  type?: 'submit' | 'button' | 'reset';
  onClick?: (event: Event) => void;
}

// Пропсы для AuthorizForm
export interface AuthorizFormProps extends BlockOwnProps {
  authorization: AuthService |{
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
    } ;
  };
  onSubmit?: (data: Record<string, string>) => void;
}

// Пропсы для RedactProfilePagee
export interface RedactProfilePageeProps extends BlockOwnProps {
  userName?: string;
  redactData: Array<{
    type: FieldType;
    name: string;
    value?: string;
    label: string;
    ref: string;
    disabled?: boolean;
  }>;
  onSave?: (data: Record<string, string>) => void;
  onSaveClick?: (event: Event) => void;
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

// Пропсы для Footer
export interface FooterProps extends BlockOwnProps {
  // Свойства футера
}

