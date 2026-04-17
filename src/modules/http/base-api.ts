export class BaseAPI {
  // На случай, если забудете переопределить метод и используете его, — выстрелит ошибка
  create(data?: unknown) { throw new Error('Not implemented'); }
  request(data?: unknown) { throw new Error('Not implemented'); }
  update(data?: unknown) { throw new Error('Not implemented'); }
  delete(id?: string | number) { throw new Error('Not implemented'); }
}
