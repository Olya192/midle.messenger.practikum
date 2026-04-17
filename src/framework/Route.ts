import Block, { type BlockOwnProps } from "./Block";
import type { BlockFactory, RouteProps } from "../types/type";

function isEqual(path1: string, path2: string): boolean {
  return path1 === path2;
}

export default class Route {
  private _pathname: string;
  private _block: Block<BlockOwnProps> | null;
  private _props: RouteProps;
  private _blockFactory: BlockFactory;
  private _rootElement: Element | null;

  constructor(pathname: string, blockFactory: BlockFactory, props: RouteProps) {
    this._pathname = pathname;
    this._blockFactory = blockFactory;
    this._block = null;
    this._props = props;
    this._rootElement = null;
  }

  public navigate(pathname: string): void {
    if (this.match(pathname)) {
      this._pathname = pathname;
      this.render();
    }
  }

  public leave(): void {
    if (this._block) {
      this._rootElement = null;
      this._block = null;
    }
  }

  public match(pathname: string): boolean {
    return isEqual(pathname, this._pathname);
  }

  public render(): void {
    const root = document.querySelector(this._props.rootQuery);
    if (!root) return;

    // Создаем новый блок через фабрику
    const newBlock = this._blockFactory();

    // Получаем элемент блока
    const element = newBlock.element();
    if (!element) return;

    // Очищаем корневой элемент и вставляем новый блок
    root.innerHTML = "";
    root.appendChild(element);

    this._block = newBlock;
    this._rootElement = element;
  }
}
