// listener callback function
// example:
// ```
// function callback(fields: string[]) {
//   console.log('the fields %s has bee changed", fields);
// }
// ```
export type Listener = (store: Store, fields: string[]) => void;

export type Middleware = (data: LogInfo) => void;

export type Reducer = (store: Store, action: ActionObject) => void;

export type StateObject = Record<string, any>;

export interface ActionObject {
  type: string;
  [key: string]: any;
}

export const LOG_TYPE_ACTION = 'ACTION';
export const LOG_TYPE_SET_STATE = 'SET_STATE';
export const LOG_TYPE_STATE_CHANGE = 'STATE_CHANGE';
export const LOG_TYPE_CURRENT_STATE = 'CURRENT_STATE';

export interface LogInfo {
  type: string;
  payload: any;
}

// field name for all listeners
export const LISTENER_ALL_FIELDS = '@@holyhi/ALL_FIELDS';

export class Store {

  protected state: StateObject;
  protected listeners: Map<string, Listener[]> = new Map();
  protected middlewares: Middleware[] = [];
  protected reducers: Map<string, Reducer> = new Map();

  constructor(initialState: StateObject = {}) {
    this.state = { ...initialState };
  }

  public getState(): any {
    return { ...this.state };
  }

  public setState(state: StateObject): this {
    this.log({ type: LOG_TYPE_SET_STATE, payload: { state } });
    let callbacks: Listener[] = this.listeners.get(LISTENER_ALL_FIELDS) || [];
    const fields: string[] = [];

    const newState = { ...this.state };
    for (const name in state) {
      fields.push(name);
      newState[name] = state[name];
      const list = this.listeners.get(name);
      if (Array.isArray(list)) {
        callbacks = callbacks.concat(list);
      }
    }

    this.log({ type: LOG_TYPE_STATE_CHANGE, payload: { state, newState: { ...newState } } });
    this.state = newState;

    if (callbacks.length > 0) {
      const list = new Set(callbacks);
      list.forEach(fn => fn(this, fields));
    }

    return this;
  }

  protected log(info: LogInfo): this {
    this.middlewares.forEach(fn => fn(info));
    return this;
  }

  public field(name: string): StateField {
    return new StateField(this, name);
  }

  public subscribe(fields: string[], callback: Listener): Subscriber {
    return new Subscriber(this, fields).subscribe(callback);
  }

  public addListener(fields: string[], callback: Listener): this {
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
    return this;
  }

  public removeListener(fields: string[], callback: Listener): this {
    for (const name of fields) {
      const list = this.listeners.get(name);
      if (Array.isArray(list)) {
        const i = list.indexOf(callback);
        if (i !== -1) {
          list.splice(i, 1);
        }
      }
    }
    return this;
  }

  public use(...middlewares: Middleware[]): this {
    this.middlewares.push(...middlewares);
    middlewares.forEach(handler => handler({ type: LOG_TYPE_CURRENT_STATE, payload: { state: this.getState() } }));
    return this;
  }

  public register(actionType: string, reducer: Reducer): this {
    this.reducers.set(actionType, reducer);
    return this;
  }

  public dispatch(action: ActionObject): this {
    const reducer = this.reducers.get(action.type);
    if (!reducer) {
      throw new Error(`action type "${action.type}" is undefined`);
    }
    this.log({ type: LOG_TYPE_ACTION, payload: action });
    reducer(this, action);
    return this;
  }

  public destroy(): void {
    delete this.state;
    delete this.listeners;
    delete this.reducers;
    delete this.middlewares;
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

  public emit(fields: string[] = []): this {
    this.callback(this.store, fields);
    return this;
  }

}

export function createStore(initialState: StateObject = {}): Store {
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

  public remove(): this {
    this.store.setState({ [this.name]: undefined });
    return this;
  }

  private getArray(): any[] {
    const a = this.get() as any[];
    if (!Array.isArray(a)) {
      throw new TypeError(`state field "${this.name}" is not an array`);
    }
    return a.slice();
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
