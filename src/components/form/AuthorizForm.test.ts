
import { AuthorizForm } from './AuthorizForm';

describe('AuthorizForm', () => {
  test('компонент должен создаваться', () => {
//@ts-expect-error - пустой пропс только для проверки, что бы работало.
    const authorizForm = new AuthorizForm({});
    expect(authorizForm).toBeDefined();
  });

  test('компонент должен иметь правильное статическое имя', () => {
    expect(AuthorizForm.componentName).toBe('AuthorizForm');
  });
});
