type Listener = () => void;

type Indexed = Record<string | symbol, unknown>;

interface User {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
}

type State = {
  inputContent?: string;
  profileData?: {
    name: string;
    email: string;
    login: string;
  };
  user?: User | null;
  isAuthenticated?: boolean;
  [key: string]: unknown;
};

class Store {
  private state: State = {
    inputContent: "profile",
    isAuthenticated: false,
    user: {
      id: 0,
      first_name: "Иван",
      second_name: "Иванов",
      display_name: "Иван Иванов",
      login: "ivan",
      email: "ivan@example.com",
      phone: "+1234567890",
      avatar: "",
    },
  };

  private listeners: Set<Listener> = new Set();

  public getState(): State {
    return this.state;
  }

  public setState(path: string, value: unknown): void {
    // Создаем новый объект состояния
    const newState: State = { ...this.state };

    // Разбиваем путь на части
    const parts = path.split(".");

    // Используем Record<string, unknown> вместо any
    let current: Record<string, unknown> = newState;

    // Идем по пути, создавая объекты при необходимости
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      // Проверяем, что current[part] - это объект
      if (typeof current[part] !== "object" || current[part] === null) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    // Устанавливаем значение
    current[parts[parts.length - 1]] = value;

    // Обновляем состояние
    this.state = newState;
    this.emit();
  }

  public setInputContent(content: string): void {
    this.setState("inputContent", content);
  }

  public getInputContent(): string {
    return this.state.inputContent || "profile";
  }

  public setUser(user: User | null): void {
  console.log('Store.setUser called with:', user);
  this.state = {
    ...this.state,
    user: user,
    isAuthenticated: !!user && user.id !== 0,
  };
  console.log('Store state after setUser:', this.state);
  this.emit();
}

  public getUser(): User | null {
  return this.state.user || null;
}

  public getUserName(): string {
    const user = this.state.user;
    if (user && user.first_name && user.id !== 0) {
      return user.first_name;
    }
    return "Гость";
  }

  public isAuthenticated(): boolean {
    return this.state.isAuthenticated || false;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

function isObject(value: unknown): value is Indexed {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function merge(target: Indexed, source: Indexed): Indexed {
  // Создаем копию target, чтобы не мутировать оригинал
  const result: Indexed = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];

      if (isObject(sourceValue)) {
        if (!isObject(result[key])) {
          result[key] = {};
        }
        result[key] = merge(result[key] as Indexed, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
  }
  return result;
}

export function set(
  object: Indexed | unknown,
  path: string,
  value: unknown,
): Indexed | unknown {
  // Проверка, что path - строка
  if (typeof path !== "string") {
    throw new Error("path must be string");
  }

  // Если object не объект, возвращаем его как есть
  if (!isObject(object)) {
    return object;
  }

  // Разбиваем путь на части
  const parts = path.split(".");

  // Создаем объект для слияния
  const nestedObject: Indexed = {};
  let current: Indexed = nestedObject;

  // Строим вложенную структуру
  for (let i = 0; i < parts.length - 1; i++) {
    const newObj: Indexed = {};
    current[parts[i]] = newObj;
    current = newObj;
  }

  // Устанавливаем значение на последнем уровне
  current[parts[parts.length - 1]] = value;

  // Возвращаем новый объект, не мутируя исходный
  const result = merge(object as Indexed, nestedObject);

  return result;
}

export default new Store();
