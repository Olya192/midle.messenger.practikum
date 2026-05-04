class MockStore {
  private state: Record<string, any> = {};
  private listeners: Array<() => void> = [];

  getState() {
    return this.state;
  }

  setState(key: string, value: any) {
    this.state[key] = value;
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener());
  }

  clear() {
    this.state = {};
    this.listeners = [];
  }
}

export const Store = new MockStore();
export default Store;
