
import { RegisdtrationForm } from './RegisdtrationForm';

describe('RegisdtrationForm', () => {
  test('компонент должен создаваться', () => {
    const props = {
      registration: {
        input: [],
        button: 'Зарегистрироваться'
      }
    };
    //@ts-expect-error - без этого ошибка но работает
    const registrationForm = new RegisdtrationForm(props);
    expect(registrationForm).toBeDefined();
  });
});
