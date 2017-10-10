import { createStore, Store } from '../../lib';

function loadStateFromLocalStorage(): any {
  return localStorage.getItem('state')
    ? JSON.parse(localStorage.getItem('state') || '{}')
    : { list: [] };
}

function saveStateToLocalStorage(state: any) {
  localStorage.setItem('state', JSON.stringify(state));
}

const store = createStore(loadStateFromLocalStorage());
store.subscribe([], () => saveStateToLocalStorage(store.getState()));

export default store;
export { Store };
