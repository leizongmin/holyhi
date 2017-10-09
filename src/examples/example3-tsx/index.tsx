import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider, State } from '../../lib';
import store from './store';
import * as action from './action';

interface TodoListProps {
  list: string[];
  removeItem: (index: number) => void;
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

class TodoList extends React.Component<TodoListProps, {}> {
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
  public input: HTMLInputElement | null;
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
        <State
          noSubscribe={true}
          render={(state, store) => (
            console.log('refresh todo-input'),
            <div className='todo-input'>
              <input ref={(ref) => this.input = ref} onKeyPress={e => {
                if (e.charCode === 13) {
                  this.add();
                }
              }} />
              <button onClick={() => this.add()}>Add</button>
            </div>
          )}
        />
        <State
          subscribe={['list']}
          render={(state, store) => (
            console.log('refresh TodoList'),
            <TodoList
              list={state.list}
              removeItem={action.removeItem}
            />
          )}
        />
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
