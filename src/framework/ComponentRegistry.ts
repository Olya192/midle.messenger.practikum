import Handlebars from "handlebars";
import type { HelperOptions } from "handlebars";
import type Block from "./Block";
import type { BlockOwnProps } from "./Block";

let uniqueId = 0;

function registerComponent<TProps extends BlockOwnProps>(Component: {
  new (props: TProps): Block<TProps | BlockOwnProps>;
  componentName: string;
}) {
  const dataAttribute = `data-component-hbs-id="${++uniqueId}"`;

  Handlebars.registerHelper(
    Component.componentName,
    function (this: unknown, { hash, data }: HelperOptions) {
     
      const component = new Component(hash);
      if ("ref" in hash) {
        (data.root.__refs = data.root.__refs || {})[hash.ref] =
          component.element();
      }

      (data.root.__children = data.root.__children || []).push({
        component,
        embed(node: DocumentFragment) {
          const placeholder = node.querySelector(`[${dataAttribute}]`);
          if (!placeholder) {
            const existingElement = component.element();
            if (existingElement && existingElement.parentNode) {
              return;
            }
            throw new Error(
              `Can't find data-id for component ${Component.componentName}`,
            );
          }

          const element = component.element();
          
          if (!element) {
            throw new Error("Component element is not created");
          }

          if (placeholder.parentNode) {
            placeholder.replaceWith(element);
          }
        },
      });

      const result = new Handlebars.SafeString(`<div ${dataAttribute}></div>`);
      return result;
    },
  );
}

export { registerComponent };
