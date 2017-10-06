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
const subscriber = store.forFields('a', 'b').subscribe(fields => {
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
