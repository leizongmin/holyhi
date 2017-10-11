import { createStore, Store, LogInfo, LOG_TYPE_CURRENT_STATE, LOG_TYPE_SET_STATE } from '../../lib';
import { array } from 'lei-async';

function loadStateFromLocalStorage(name: string, defaultValue: any): any {
  return localStorage.getItem(name)
    ? JSON.parse(localStorage.getItem(name) || 'null')
    : defaultValue;
}

function saveStateToLocalStorage(name: string, state: any) {
  localStorage.setItem(name, JSON.stringify(state));
}

const store = createStore(loadStateFromLocalStorage('state', { list: [] }));
store.subscribe([], () => saveStateToLocalStorage('state', store.getState()));
store.use(data => console.log(data));

store.register('addItem', (store, action) => {
  store.field('list').unshift(action.msg);
});

store.register('removeItem', (store, action) => {
  store.field('list').splice(action.index, 1);
});

const global = window as any;
global.logs = loadStateFromLocalStorage('logs', []);
store.use(data => {
  global.logs.push(data);
  saveStateToLocalStorage('logs', global.logs);
});

function clearLogs() {
  global.logs = [];
  saveStateToLocalStorage('logs', global.logs);
}

function sleep(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

async function playback() {
  const logs: LogInfo[] = global.logs.slice();
  await array(logs).forEach(async (item: LogInfo, index) => {
    if (item.type === LOG_TYPE_CURRENT_STATE || item.type === LOG_TYPE_SET_STATE) {
      console.log('playback #%s', index);
      store.setState(item.payload.state);
      await sleep(1000);
    }
  });
  clearLogs();
  console.log('done');
}

export default store;
export { Store, playback, clearLogs };
