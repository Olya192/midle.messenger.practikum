
import { AutorizationPage } from './autorizationPage';
import Block from '../../framework/Block';

describe('AutorizationPage', () => {
  test('компонент должен создаваться', () => {
    const autorizationPage = new AutorizationPage();
    expect(autorizationPage).toBeDefined();
  });

  test('компонент должен иметь правильное статическое имя', () => {
    expect(AutorizationPage.componentName).toBe('AutorizationPage');
  });

  test('компонент должен наследоваться от Block', () => {
    const autorizationPage = new AutorizationPage();
    expect(autorizationPage instanceof Block).toBe(true);
  });
});
