import { AuthAPI, type SignUpRequest } from "../../api/auth-api";
import Block from "../../framework/Block";
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

export class RegisdtrationForm extends Block<AuthorizFormProps> {
  static componentName = "RegisdtrationForm";
  
  protected template = `<div class="main">
  <h1 class="main__title">Вход</h1>
  <form action="" method="get" class="main-form" id="auth-form">
{{#each registration.input}}
{{{InputForm type=this.type name=this.name ref=this.ref label=this.label}}}
    {{/each}}
    <div class="main-form__button-box">
      {{ButtonForm  button=registration.button}}
    <p class="main-form__link" id='link'>Войти</p>
    </div>
  </form>
</div>
`;

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
          router.back();
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
      // Оставляем только безопасные символы для разных полей
      let sanitizedValue = value.trim();
      
      // Для разных полей своя логика валидации
      switch (key) {
        case 'first_name':
        case 'second_name':
          // Только буквы, дефис и пробел
          sanitizedValue = sanitizedValue.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, '');
          break;
          
        case 'login':
          // Буквы, цифры, дефис, подчеркивание
          sanitizedValue = sanitizedValue.replace(/[^a-zA-Z0-9_-]/g, '');
          break;
          
        case 'email':
          // Базовая очистка email (оставляем только допустимые символы)
          sanitizedValue = sanitizedValue.replace(/[^a-zA-Z0-9@._-]/g, '');
          break;
          
        case 'phone':
          // Только цифры, плюс, скобки, дефис, пробел
          sanitizedValue = sanitizedValue.replace(/[^0-9+()\s-]/g, '');
          break;
          
        case 'password':
        case 'tow-password':
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
  // Здесь просто экранируем потенциально опасные символы
  private sanitizeForSQL(value: string): string {
    // Экранируем символы, опасные для SQL
    const sqlEscapes: Record<string, string> = {
      "'": "''",
      '\\': '\\\\',
      '%': '\\%',
      '_': '\\_'
    };
    return value.replace(/['\\%_]/g, (char) => sqlEscapes[char]);
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

    const passwordsMatch = this.validatePasswordMatch();
    if (!passwordsMatch) {
      isValid = false;
    }

    if (isValid) {
      try {
        const authAPI = new AuthAPI();
        
        const body: SignUpRequest = {
          first_name: this.sanitizeForSQL(formData.first_name),
          second_name: this.sanitizeForSQL(formData.second_name),
          login: this.sanitizeForSQL(formData.login),
          email: this.sanitizeForSQL(formData.email),
          password: formData.password,
          phone: this.sanitizeForSQL(formData.phone),
        };
        
        const response = await authAPI.signup(body);
        if (response) {
          const router = getRouter();
          router.go("/messenger");
        }
      } catch (error) {
        console.error("Registration error:", error);
        this.showErrorMessage("Ошибка регистрации. Попробуйте позже.");
      }
    } else {
      console.log("Форма содержит ошибки, исправьте их перед отправкой");
    }
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

  private showErrorMessage(message: string): void {
    // Показываем сообщение об ошибке пользователю
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

  private validatePasswordMatch(): boolean {
    const passwordField = this.inputFields.get("password");
    const confirmPasswordField = this.inputFields.get("tow-password");

    if (passwordField && confirmPasswordField) {
      const password = passwordField.getValue();
      const confirmPassword = confirmPasswordField.getValue();

      if (password !== confirmPassword) {
        confirmPasswordField.showCustomError("Пароли не совпадают");
        return false;
      }
    }
    return true;
  }

  protected componentWillUnmount(): void {
    const form = this.element()?.querySelector("#auth-form");
    if (form) {
      form.removeEventListener("submit", this.handleSubmit.bind(this));
    }
    super.componentWillUnmount();
  }
}
