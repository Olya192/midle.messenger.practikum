import type { BlockOwnProps } from "../framework/Block";
import type Block from "../framework/Block";


export function render(
  query: string, 
  block: Block<BlockOwnProps>
): Element | null {
  const root = document.querySelector(query);
  if (!root) return null;
  
  root.innerHTML = '';
  const element = block.element();
  if (element) {
    root.appendChild(element);
  }
  
  return root;
}

export function renderBlock(
  query: string,
  BlockClass: new (props: BlockOwnProps) => Block<BlockOwnProps>,
  props: BlockOwnProps
): Element | null {
  const block = new BlockClass(props);
  return render(query, block);
}
