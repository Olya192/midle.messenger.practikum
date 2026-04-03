import Block from "../../framework/Block";

export class RegisdtrationPage extends Block {
  static componentName = "RegisdtrationPage";
  protected template = `<main class="authorization">
    {{{RegisdtrationForm registration=registration}}}
{{{Footer}}}    
</main>
`;
}
