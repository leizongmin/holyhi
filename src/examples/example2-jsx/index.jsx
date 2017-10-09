import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, Provider, State } from '../../lib';

class TodoItem extends React.Component {
  render() {
    return (
      <div className='todo-item'>
        <span>{this.props.message}</span>
        <button onClick={() => this.props.remove()}>X</button>
      </div>
    );
  }
}

class TodoList extends React.Component {
  render() {
    return (
      <div className='todo-list'>
        {this.props.list.map((item, index) => (
          <TodoItem
            key={index + '+' + item}
            message={item}
            index={index}
            remove={() => this.props.removeItem(index)}
          />
        ))}
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    console.log('refresh App');
    const add = (store) => {
      const input = this.input;
      if (input) {
        const msg = input.value;
        if (!msg) return;
        store.field('list').unshift(msg);
        input.value = '';
      }
    };
    return (
      <div className='app'>
        <State
          noSubscribe={true}
          render={(state, store) => (
            console.log('refresh todo-input'),
            <div className='todo-input'>
              <input ref={(ref) => this.input = ref} onKeyPress={e => {
                if (e.charCode === 13) {
                  add(store);
                }
              }} />
              <button onClick={() => add(store)}>Add</button>
            </div>
          )}
        />
        <State
          subscribe={['list']}
          render={(state, store) => (
            console.log('refresh TodoList'),
            <TodoList
              list={state.list}
              removeItem={(i) => store.field('list').splice(i, 1)}
            />
          )}
        />
      </div>
    );
  }
}

function loadStateFromLocalStorage() {
  return localStorage.getItem('state')
    ? JSON.parse(localStorage.getItem('state') || '{}')
    : { list: [] };
}

function saveStateToLocalStorage(state) {
  localStorage.setItem('state', JSON.stringify(state));
}

const store = createStore(loadStateFromLocalStorage());
store.subscribe([], () => saveStateToLocalStorage(store.getState()));

const app = ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'));
window.app = app;
