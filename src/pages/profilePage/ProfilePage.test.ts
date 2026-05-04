
import { ProfilePage } from './ProfilePage';

describe('ProfilePage', () => {
  test('компонент должен создаваться', () => {
    const profilePage = new ProfilePage();
    expect(profilePage).toBeDefined();
  });

  test('компонент должен иметь правильное статическое имя', () => {
    expect(ProfilePage.componentName).toBe('ProfilePage');
  });

  test('должен иметь метод forceUpdate для принудительного обновления', () => {
    const profilePage = new ProfilePage();
    expect(typeof profilePage.forceUpdate).toBe('function');
  });
});
