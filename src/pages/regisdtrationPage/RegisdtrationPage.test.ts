
import { RegisdtrationPage } from './RegisdtrationPage';
import Block from '../../framework/Block';

describe('RegisdtrationPage', () => {
  test('компонент должен создаваться', () => {
    const registrationPage = new RegisdtrationPage();
    expect(registrationPage).toBeDefined();
  });

  test('компонент должен иметь правильное статическое имя', () => {
    expect(RegisdtrationPage.componentName).toBe('RegisdtrationPage');
  });

  test('компонент должен наследоваться от Block', () => {
    const registrationPage = new RegisdtrationPage();
    expect(registrationPage instanceof Block).toBe(true);
  });
});
