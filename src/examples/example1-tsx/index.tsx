import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, Store, Subscriber } from '../../lib';

interface Props {
  store: Store;
}

interface TodoItemProps extends Props {
  message: string;
  index: number;
}

interface TodoListState {
  list: string[];
}

class TodoItem extends React.Component<TodoItemProps> {
  render() {
    return (
      <div className='todo-item'>
        <span>{this.props.message}</span>
        <button onClick={() => {
          this.props.store.field('list').splice(this.props.index, 1);
        }}>X</button>
      </div>
    );
  }
}

class TodoList extends React.Component<Props, TodoListState> {
  private subscriber: Subscriber;
  componentWillMount() {
    const update = () => this.setState({ list: this.props.store.field('list').get() });
    this.subscriber = this.props.store.subscribe(['list'], update).emit();
  }
  componentWillUnmount() {
    this.subscriber.unsubscribe();
  }
  render() {
    return (
      <div className='todo-list'>
        {this.state.list.map((item, index) => <TodoItem
          store={this.props.store}
          key={index}
          message={item}
          index={index}
        />)}
      </div>
    );
  }
}

class App extends React.Component<Props> {
  add() {
    const input = this.refs.input as HTMLInputElement;
    const msg = input.value;
    if (!msg) return;
    this.props.store.field('list').unshift(msg);
    input.value = '';
  }
  render() {
    return (
      <div className='app'>
        <div className='todo-input'>
          <input ref='input' onKeyPress={e => {
            if (e.charCode === 13) {
              this.add();
            }
          }} />
          <button onClick={() => this.add()}>Add</button>
        </div>
        <TodoList store={this.props.store} />
      </div>
    );
  }
}

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
store.use(data => console.log(data));

const app = ReactDOM.render((
  <App store={store} />
), document.getElementById('app'));
(window as any).app = app;
