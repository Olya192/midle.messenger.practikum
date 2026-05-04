// @ts-nocheck
import { RegisdtrationForm } from './RegisdtrationForm';

describe('RegisdtrationForm', () => {
  test('компонент должен создаваться', () => {
    const props = {
      registration: {
        input: [],
        button: 'Зарегистрироваться'
      }
    };
    const registrationForm = new RegisdtrationForm(props);
    expect(registrationForm).toBeDefined();
  });
});
