import { expect } from 'chai';
import * as React from 'react';
import * as TestUtils from 'react-dom/test-utils';
import { createStore, Store, Provider, connect, CONTEXT_NAME } from '../lib';

describe('@connect', function () {

  it('subscribe', function () {
    const s = createStore({ counter: 0 });

    let renderCounter = 0;

    @connect({
      subscribe: ['counter'],
      mapStore: 'store',
    })
    class Counter extends React.Component<{}, { counter: number }> {
      store: Store;
      render() {
        renderCounter++;
        return (
          <div>
            <span>{this.state.counter}</span>
          </div>
        );
      }
    }

    class App extends React.Component {
      render() {
        return (
          <Provider store={s}>
            <Counter />
          </Provider>
        );
      }
    }

    const tree = TestUtils.renderIntoDocument(<App />) as any;
    expect(tree).to.not.equal(undefined);
    {
      const container = TestUtils.findRenderedComponentWithType(tree, Counter) as any;
      expect(container.store).to.equal(s);
      expect(container.context[CONTEXT_NAME]).to.not.equal(undefined);
      expect(container.context[CONTEXT_NAME].store).to.equal(s);
    }
    {
      const container = TestUtils.findRenderedComponentWithType(tree, Provider);
      const context = container.getChildContext();
      expect(context[CONTEXT_NAME]).to.not.equal(undefined);
      expect(context[CONTEXT_NAME].store).to.equal(s);
      expect(container.props.store).to.equal(s);
    }

    expect(renderCounter).to.equal(1);
    s.field('counter').add(2);
    s.field('counter').add(4);
    s.field('counter').add(6);
    s.field('counter').add(8);
    expect(renderCounter).to.equal(5);

    s.destroy();
  });

  it('no subscribe', function () {
    const s = createStore({ counter: 0 });

    let renderCounter = 0;

    @connect({
      mapStore: 'store2',
    })
    class Counter extends React.Component<{}, { counter: number }> {
      store2: Store;
      state: any = {};
      render() {
        renderCounter++;
        return (
          <div>
            <span>{this.state.counter}</span>
          </div>
        );
      }
    }

    class App extends React.Component {
      render() {
        return (
          <Provider store={s}>
            <Counter />
          </Provider>
        );
      }
    }

    const tree = TestUtils.renderIntoDocument(<App />) as any;
    expect(tree).to.not.equal(undefined);
    {
      const container = TestUtils.findRenderedComponentWithType(tree, Counter) as any;
      expect(container.store2).to.equal(s);
      expect(container.context[CONTEXT_NAME]).to.not.equal(undefined);
      expect(container.context[CONTEXT_NAME].store).to.equal(s);
    }
    {
      const container = TestUtils.findRenderedComponentWithType(tree, Provider);
      const context = container.getChildContext();
      expect(context[CONTEXT_NAME]).to.not.equal(undefined);
      expect(context[CONTEXT_NAME].store).to.equal(s);
      expect(container.props.store).to.equal(s);
    }

    expect(renderCounter).to.equal(1);
    s.field('counter').add(2);
    s.field('counter').add(4);
    s.field('counter').add(6);
    s.field('counter').add(8);
    expect(renderCounter).to.equal(1);

    s.destroy();
  });

});
