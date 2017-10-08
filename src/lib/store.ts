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
export const LISTENER_ALL = '@@holyhi/ALL';

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
    let callbacks: Listener[] = this.listeners.get(LISTENER_ALL) || [];
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

  public subscribe(fields: string[], callback: Listener): Subscriber {
    return new Subscriber(this).subscribe(fields, callback);
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

  constructor(private store: Store) { }

  public subscribe(fields: string[], callback: Listener): this {
    this.fields = fields.length > 0 ? fields.slice() : [LISTENER_ALL];
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

}

export function createStore(initialState: any = {}): Store {
  return new Store(initialState);
}
