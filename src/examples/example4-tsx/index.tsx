import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider, subscribe } from '../../lib';
import store from './store';
import * as action from './action';

interface TodoListState {
  list: string[];
}

interface TodoItemProps {
  message: string;
  index: number;
  remove: () => void;
}

class TodoItem extends React.Component<TodoItemProps> {
  render() {
    return (
      <div className='todo-item'>
        <span>{this.props.message}</span>
        <button onClick={() => this.props.remove()}>X</button>
      </div>
    );
  }
}

@subscribe({
  fields: ['list'],
  mapState: (state) => ({ list: state.list }),
  mapStore: 'store',
})
class TodoList extends React.Component<{}, TodoListState> {
  render() {
    console.log('Refresh TodoList');
    return (
      <div className='todo-list'>
        {this.state.list.map((item, index) => (
          <TodoItem
            key={index + '+' + item}
            message={item}
            index={index}
            remove={() => action.removeItem(index)}
          />
        ))}
      </div>
    );
  }
}

class App extends React.Component {
  input: HTMLInputElement | null;
  add() {
    const input = this.input;
    if (input) {
      const msg = input.value;
      if (!msg) return;
      action.addItem(msg);
      input.value = '';
    }
  }
  render() {
    console.log('refresh App');
    return (
      <div className='app'>
        <div className='todo-input'>
          <input ref={(ref) => this.input = ref} onKeyPress={e => {
            if (e.charCode === 13) {
              this.add();
            }
          }} />
          <button onClick={() => this.add()}>Add</button>
        </div>
        <TodoList />
      </div>
    );
  }
}

const app = ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'));
(window as any).app = app;
