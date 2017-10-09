import * as immutable from 'immutable';

// listener callback function
// example:
// ```
// function callback(fields: string[]) {
//   console.log('the fields %s has bee changed", fields);
// }
// ```
export type Listener = (fields: string[]) => void;

// field name for all listeners
export const LISTENER_ALL_FIELDS = '@@holyhi/ALL_FIELDS';

export class Store {

  protected state: immutable.Map<string, any>;
  protected listeners: Map<string, Listener[]> = new Map();

  constructor(initialState: any = {}) {
    this.state = immutable.fromJS(initialState);
  }

  public getState(): any {
    return this.state.toJS();
  }

  public setState(state: any): void {
    let callbacks: Listener[] = this.listeners.get(LISTENER_ALL_FIELDS) || [];
    const fields: string[] = [];
    for (const name in state) {
      fields.push(name);
      this.state = this.state.set(name, state[name]);
      const list = this.listeners.get(name);
      if (Array.isArray(list)) {
        callbacks = callbacks.concat(list);
      }
    }
    if (callbacks.length > 0) {
      const list = new Set(callbacks);
      list.forEach(fn => fn(fields));
    }
  }

  public field(name: string): StateField {
    return new StateField(this, name);
  }

  public subscribe(fields: string[], callback: Listener): Subscriber {
    return new Subscriber(this, fields).subscribe(callback);
  }

  public addListener(fields: string[], callback: Listener): void {
    for (const name of fields) {
      const list = this.listeners.get(name);
      if (Array.isArray(list)) {
        if (list.indexOf(callback) === -1) {
          list.push(callback);
        }
      } else {
        this.listeners.set(name, [callback]);
      }
    }
  }

  public removeListener(fields: string[], callback: Listener): void {
    for (const name of fields) {
      const list = this.listeners.get(name);
      if (Array.isArray(list)) {
        const i = list.indexOf(callback);
        if (i !== -1) {
          list.splice(i, 1);
        }
      }
    }
  }

  public destroy(): void {
    delete this.state;
    delete this.listeners;
  }

}

export class Subscriber {

  public listening: boolean = false;
  private fields: string[];
  private callback: Listener;

  constructor(private store: Store, fields: string[]) {
    this.fields = fields.length > 0 ? fields.slice() : [LISTENER_ALL_FIELDS];
  }

  public subscribe(callback: Listener): this {
    this.callback = callback;
    this.store.addListener(this.fields, this.callback);
    this.listening = true;
    return this;
  }

  public unsubscribe(): void {
    this.store.removeListener(this.fields, this.callback);
    delete this.store;
    delete this.callback;
    delete this.fields;
    delete this.listening;
  }

  public emit(fields: any[] = []): this {
    this.callback(fields);
    return this;
  }

}

export function createStore(initialState: any = {}): Store {
  return new Store(initialState);
}

export class StateField {

  constructor(private store: Store, public name: string) { }

  public subscribe(callback: (newValue: any) => void): Subscriber {
    return this.store.subscribe([this.name], () => callback(this.get()));
  }

  public set(value: any): this {
    this.store.setState({ [this.name]: value });
    return this;
  }

  public get(): any {
    return this.store.getState()[this.name];
  }

  private getArray(): any[] | undefined {
    const a = this.get() as any[];
    if (!Array.isArray(a)) {
      throw new TypeError(`state field "${this.name}" is not an array`);
    }
    return a;
  }

  public push(...items: any[]): this {
    const a = this.getArray();
    if (a) {
      a.push(...items);
      this.set(a);
    }
    return this;
  }

  public pop(): any {
    const a = this.getArray();
    if (a) {
      const v = a.pop();
      this.set(a);
      return v;
    }
  }

  public shift(): any {
    const a = this.getArray();
    if (a) {
      const v = a.shift();
      this.set(a);
      return v;
    }
  }

  public unshift(...items: any[]): this {
    const a = this.getArray();
    if (a) {
      a.unshift(...items);
      this.set(a);
    }
    return this;
  }

  public splice(start: number, deleteCount?: number): this {
    const a = this.getArray();
    if (a) {
      a.splice(start, deleteCount);
      this.set(a);
    }
    return this;
  }

  public add(n: number): this {
    return this.set(this.get() + n);
  }

  public sub(n: number): this {
    return this.set(this.get() - n);
  }

}
