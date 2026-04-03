import Block from "../../framework/Block";

export class AutorizationPage extends Block {
  static componentName = "AutorizationPage";
  protected template = `<main class="authorization">
    {{{AuthorizForm authorization=authorization}}}
{{{Footer}}}    
</main>
`;

}
