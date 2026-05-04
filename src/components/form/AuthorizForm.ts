import { AuthAPI } from "../../api/auth-api";
import Block from "../../framework/Block";
import Store from "../../store/Store";
import type { AuthorizFormProps } from "../../types/type";
import { getRouter } from "../../utils/navigation";
import { InputForm } from "../input/InputForm";

// Функция для экранирования HTML
function escapeHtml(str: string): string {
  if (!str) return '';
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return str.replace(/[&<>"'/`=]/g, (char) => htmlEscapes[char]);
}

export class AuthorizForm extends Block<AuthorizFormProps> {
  static componentName = "AuthorizForm";
  
  protected template = `<div class="main">
 <h1 class="main__title">Вход</h1>
    <form action="" method="get" class="main-form" id="auth-form">
      {{#each authorization.input}}
        {{{InputForm type=this.type name=this.name ref=this.ref label=this.label}}}
      {{/each}}
      <div class="main-form__button-box">
        {{{ButtonForm button=authorization.button navigateTo="/chats"}}}
        <p class="main-form__link" id='link'>Нет аккаунта?</p>
      </div>
    </form>
  </div>`;

  private inputFields: Map<string, InputForm> = new Map();

  constructor(props: AuthorizFormProps) {
    super(props);
  }

  protected events = {
    click: (e: Event) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      const id = target?.id;
      const router = getRouter();

      switch (id) {
        case "link":
          router.go("/sign-up");
          break;

        default:
          break;
      }
    },
  };

  protected componentDidMount(): void {
    super.componentDidMount();

    this.collectInputFields();

    const form = this.element()?.querySelector("#auth-form");
    if (form) {
      form.addEventListener("submit", this.handleSubmit.bind(this));
    }
  }

  private collectInputFields(): void {
    this.props.__children?.forEach((child) => {
      const component = child.component;
      if (component instanceof InputForm) {
        const name = component.getName();
        if (name) {
          this.inputFields.set(name, component);
        }
      }
    });
  }

  // Санитизация данных перед отправкой
  private sanitizeInput(data: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(data)) {
      let sanitizedValue = value.trim();
      
      // Для разных полей своя логика валидации
      switch (key) {
        case 'login':
          // Буквы, цифры, дефис, подчеркивание
          sanitizedValue = sanitizedValue.replace(/[^a-zA-Z0-9_-]/g, '');
          break;
          
        case 'password':
          // Для пароля не экранируем спецсимволы, но проверяем длину
          if (sanitizedValue.length > 100) {
            sanitizedValue = sanitizedValue.substring(0, 100);
          }
          break;
          
        default:
          // Для неизвестных полей - полное экранирование
          sanitizedValue = escapeHtml(sanitizedValue);
      }
      
      sanitized[key] = sanitizedValue;
    }
    
    return sanitized;
  }

  // Вспомогательный метод для очистки значения поля
  private sanitizeInputValue(value: string): string {
    if (!value) return '';
    
    // Удаляем потенциально опасные HTML теги и атрибуты
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<img[^>]+>/gi, '');
  }

  // Валидация на SQL инъекции (через параметризованные запросы на бэке)
  private sanitizeForSQL(value: string): string {
    const sqlEscapes: Record<string, string> = {
      "'": "''",
      '\\': '\\\\',
      '%': '\\%',
      '_': '\\_'
    };
    return value.replace(/['\\%_]/g, (char) => sqlEscapes[char]);
  }

  // Проверка на XSS паттерны
  private containsXSSPattern(value: string): boolean {
    const xssPatterns = [
      /<script\b/i,
      /javascript:/i,
      /onerror\s*=/i,
      /onload\s*=/i,
      /onclick\s*=/i,
      /<iframe\b/i,
      /<object\b/i,
      /<embed\b/i,
      /<link\b/i,
      /expression\s*\(/i,
      /url\s*\(/i,
      /<img[^>]+src\s*=\s*["'][^"']*["']/i
    ];
    
    return xssPatterns.some(pattern => pattern.test(value));
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    let isValid = true;
    const rawFormData: Record<string, string> = {};

    // Собираем данные
    this.inputFields.forEach((field, name) => {
      const fieldIsValid = field.validate();
      if (!fieldIsValid) {
        isValid = false;
      }
      rawFormData[name] = field.getValue();
    });

    // Санитизируем все данные перед отправкой
    const formData = this.sanitizeInput(rawFormData);

    // Проверка на XSS паттерны
    for (const [key, value] of Object.entries(formData)) {
      if (this.containsXSSPattern(value)) {
        console.warn(`Potential XSS detected in field ${key}`);
        isValid = false;
        const field = this.inputFields.get(key);
        if (field) {
          field.showCustomError("Обнаружены недопустимые символы");
        }
      }
    }

    if (isValid) {
      try {
        const authAPI = new AuthAPI();
        const body = { 
          login: this.sanitizeForSQL(formData.login), 
          password: formData.password 
        };
        
        const responseAuth = await authAPI.signin(body);
        const router = getRouter();
        
        if (responseAuth) {
          const user = Store.getUser();
          console.log("user", user);
          router.go("/messenger");
        }
      } catch (error) {
        console.error("Authorization error:", error);
        this.showErrorMessage("Ошибка авторизации. Попробуйте позже.");
      }
    } else {
      console.log("Форма содержит ошибки, исправьте их перед отправкой");
    }
  }

  private showErrorMessage(message: string): void {
    const form = this.element()?.querySelector("#auth-form");
    if (form) {
      let errorDiv = form.querySelector('.form-error-message') as HTMLElement;
      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        form.prepend(errorDiv);
      }
      errorDiv.textContent = message;
      errorDiv.style.color = 'red';
      errorDiv.style.marginBottom = '10px';
    }
  }

  validateForm(): boolean {
    let isValid = true;
    this.inputFields.forEach((field) => {
      if (!field.validate()) {
        isValid = false;
      }
    });
    return isValid;
  }

  getFormData(): Record<string, string> {
    const formData: Record<string, string> = {};
    this.inputFields.forEach((field, name) => {
      const value = field.getValue();
      formData[name] = this.sanitizeInputValue(value);
    });
    return this.sanitizeInput(formData);
  }

  clearAllErrors(): void {
    this.inputFields.forEach((field) => {
      field.clearError();
    });
  }

  protected componentWillUnmount(): void {
    const form = this.element()?.querySelector("#auth-form");
    if (form) {
      form.removeEventListener("submit", this.handleSubmit.bind(this));
    }
    super.componentWillUnmount();
  }
}
