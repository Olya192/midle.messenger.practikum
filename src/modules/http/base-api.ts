export class BaseAPI {
  // На случай, если забудете переопределить метод и используете его, — выстрелит ошибка
  create(_data?: unknown) { void _data; throw new Error('Not implemented'); }
  request(_data?: unknown) { void _data; throw new Error('Not implemented'); }
  update(_data?: unknown) { void _data; throw new Error('Not implemented'); }
  delete(_id?: string | number) { void _id;throw new Error('Not implemented'); }
}
