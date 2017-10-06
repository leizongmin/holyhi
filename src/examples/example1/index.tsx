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
          const store = this.props.store;
          const list = store.getState().list as string[];
          list.splice(this.props.index, 1);
          store.setState({ list });
        }}>X</button>
      </div>
    );
  }
}

class TodoList extends React.Component<Props, TodoListState> {
  private subscriber: Subscriber;
  componentWillMount() {
    this.setState({ list: this.props.store.getState().list });
    this.subscriber = this.props.store.forFields('list').subscribe(() => {
      this.setState({ list: this.props.store.getState().list });
    });
  }
  componentWillUnmount() {
    this.subscriber.unsubscribe();
  }
  render() {
    return (
      <div className='todo-list'>
        {this.state.list.map((item, index) => <TodoItem
          store={this.props.store}
          key={item}
          message={item}
          index={index}
        />)}
      </div>
    );
  }
}

class App extends React.Component<Props> {
  add() {
    const store = this.props.store;
    const input = this.refs.input as HTMLInputElement;
    const msg = input.value;
    if (!msg) return;
    const list = store.getState().list as string[];
    list.unshift(msg);
    store.setState({ list });
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
store.allFields().subscribe(() => saveStateToLocalStorage(store.getState()));

const app = ReactDOM.render((
  <App store={store} />
), document.getElementById('root'));
(window as any).app = app;
