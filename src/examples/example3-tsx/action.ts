import store from './store';

export function addItem(msg: string): void {
  store.field('list').unshift(msg);
}

export function removeItem(index: number): void {
  store.field('list').splice(index, 1);
}
