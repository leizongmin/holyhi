[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]
[![npm license][license-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/holyhi.svg?style=flat-square
[npm-url]: https://npmjs.org/package/holyhi
[travis-image]: https://img.shields.io/travis/leizongmin/holyhi.svg?style=flat-square
[travis-url]: https://travis-ci.org/leizongmin/holyhi
[coveralls-image]: https://img.shields.io/coveralls/leizongmin/holyhi.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/leizongmin/holyhi?branch=master
[david-image]: https://img.shields.io/david/leizongmin/holyhi.svg?style=flat-square
[david-url]: https://david-dm.org/leizongmin/holyhi
[node-image]: https://img.shields.io/badge/node.js-%3E=_6.0-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/holyhi.svg?style=flat-square
[download-url]: https://npmjs.org/package/holyhi
[license-image]: https://img.shields.io/npm/l/holyhi.svg

# holyhi

state management library that very easy to use

## Installation

```bash
npm install holyhi --save
```

## Usage

```typescript
import { createStore } from 'holyhi';

// create new store with initial state
const store = createStore({});

// subscribe for fields changed
const subscriber = store.subscribe(['a', 'b'], fields => {
  console.log('fields changed: %s', fields);
});

// change state
store.setState({
  a: 123,
  b: 456,
});

// unsubscribe
subscriber.unsubscribe();
```

React:

```tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, Store, Provider, State } from 'holyhi';

const store = createStore({
  a: 123,
  b: 456,
  c: 789,
});
ReactDOM.render((
  <Provider store={store}>
    <State
      subscribe={['a', 'b']}
      render={(state, store) => (
        <App a={state.a} b={state.b} store={store} />
      )}
    />
    <App />
  </Provider>
), document.getElementById('root'));

interface AppProps {
  a: number;
  b: number;
  store: Store;
}

class App extends React.Component<AppProps> {
  render() {
    return (
      <div>
        A: <input ref='a' />
        B: <input ref='b' />
        <button onClick={() => this.getResult()}>=</button>
        <span>{state.a + state.b}</span>
      </div>
    );
  }
  getResult() {
    const a = Number(this.refs.a.value);
    const b = Number(this.refs.a.value);
    this.props.store.setState({ a, b });
  }
}
```

## Examples

See [the examples source directory](https://github.com/leizongmin/holyhi/tree/master/src/examples)

## License

```text
MIT License

Copyright (c) 2017 Zongmin Lei <leizongmin@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
