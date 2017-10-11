import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore } from '../../lib';

class TodoItem extends React.Component {
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

class TodoList extends React.Component {
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

class App extends React.Component {
  add() {
    const input = this.refs.input;
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
store.use(data => console.log(data));

const app = ReactDOM.render((
  <App store={store} />
), document.getElementById('app'));
window.app = app;
