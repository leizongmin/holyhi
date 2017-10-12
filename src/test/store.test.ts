import { expect } from 'chai';
import { createStore } from '../lib';

describe('store', function () {

  it('no initial state', function () {
    const s = createStore();
    const ret: string[][] = [];
    const a = s.subscribe([], (store, fields) => {
      ret.push(fields);
    });

    s.setState({ a: 123 });
    s.setState({ b: 456 });
    s.setState({ a: 789, c: 666, d: 555 });
    a.unsubscribe();
    s.setState({ x: 1, y: 2, z: 3 });

    expect(s.getState()).to.deep.equal({
      a: 789,
      b: 456,
      c: 666,
      d: 555,
      x: 1,
      y: 2,
      z: 3,
    });
    expect(ret).to.deep.equal([
      ['a'],
      ['b'],
      ['a', 'c', 'd'],
    ]);

    s.destroy();
    expect(() => s.setState({})).throws();
  });

  it('with initial state', function () {
    const s = createStore({ abc: 111 });
    s.setState({ xyz: 222 });
    expect(s.getState()).to.deep.equal({
      abc: 111,
      xyz: 222,
    });
  });

  it('only subscribe for specified field names', function () {
    const s = createStore();
    const fall: string[][] = [];
    const fa: string[][] = [];
    const fbc: string[][] = [];
    const sall = s.subscribe([], (store, fields) => fall.push(fields));
    const sa = s.subscribe(['a'], (store, fields) => fa.push(fields));
    const sbc = s.subscribe(['b', 'c'], (store, fields) => fbc.push(fields));

    s.setState({ x: 111 });
    s.setState({ a: 123 });
    s.setState({ b: 456 });
    s.setState({ c: 789 });
    s.setState({ y: 124, b: 555 });

    expect(s.getState()).to.deep.equal({
      x: 111,
      a: 123,
      b: 555,
      c: 789,
      y: 124,
    });
    expect(fall).to.deep.equal([
      ['x'],
      ['a'],
      ['b'],
      ['c'],
      ['y', 'b'],
    ]);
    expect(fa).to.deep.equal([
      ['a'],
    ]);
    expect(fbc).to.deep.equal([
      ['b'],
      ['c'],
      ['y', 'b'],
    ]);

    sall.unsubscribe();
    sbc.unsubscribe();

    s.setState({ a: 444, c: 333 });
    s.setState({ b: 456 });

    expect(s.getState()).to.deep.equal({
      x: 111,
      a: 444,
      b: 456,
      c: 333,
      y: 124,
    });
    expect(fall).to.deep.equal([
      ['x'],
      ['a'],
      ['b'],
      ['c'],
      ['y', 'b'],
    ]);
    expect(fa).to.deep.equal([
      ['a'],
      ['a', 'c'],
    ]);
    expect(fbc).to.deep.equal([
      ['b'],
      ['c'],
      ['y', 'b'],
    ]);

    sa.unsubscribe();
    s.destroy();
  });

  describe('state field', function () {

    it('subscribe', function () {
      const s = createStore();
      const ret: number[] = [];
      const a = s.field('a').subscribe(v => ret.push(v));

      s.setState({ a: 123, b: 456 });
      s.setState({ c: 789 });
      s.setState({ a: 666 });
      s.setState({ b: 999 });
      s.setState({ a: 222 });

      expect(ret).to.deep.equal([123, 666, 222]);
      expect(s.getState()).to.deep.equal({
        a: 222,
        b: 999,
        c: 789,
      });

      a.unsubscribe();
      s.destroy();
    });

    it('get / set / remove', function () {
      const s = createStore({ a: 111 });

      expect(s.field('b').get()).to.equal(undefined);
      expect(s.field('b').set('hello').get()).to.equal('hello');
      expect(s.field('b').get()).to.equal('hello');

      expect(s.field('a').get()).to.equal(111);
      s.field('a').set(789);
      expect(s.field('a').get()).to.equal(789);

      expect(s.field('a').remove().get()).to.equal(undefined);
      expect(s.field('a').get()).to.equal(undefined);

      s.destroy();
    });

    it('splice, push, pop, shift, unshift', function () {
      const s = createStore({ a: 111, b: [111] });

      expect(() => s.field('a').push(1)).to.throws('not an array');
      expect(() => s.field('a').pop()).to.throws('not an array');
      expect(() => s.field('a').shift()).to.throws('not an array');
      expect(() => s.field('a').unshift(1)).to.throws('not an array');
      expect(() => s.field('a').splice(1, 1)).to.throws('not an array');

      expect(s.field('a').add(222).sub(333).add(456).get()).to.equal(456);

      s.field('b').push(222, 333);
      expect(s.field('b').get()).to.deep.equal([111, 222, 333]);

      expect(s.field('b').pop()).to.equal(333);
      expect(s.field('b').pop()).to.equal(222);
      expect(s.field('b').get()).to.deep.equal([111]);

      s.field('b').unshift(222, 333, 444);
      expect(s.field('b').get()).to.deep.equal([222, 333, 444, 111]);

      expect(s.field('b').shift()).to.equal(222);
      expect(s.field('b').shift()).to.equal(333);
      expect(s.field('b').get()).to.deep.equal([444, 111]);

      s.field('b').push(555, 666, 777).splice(0, 3);
      expect(s.field('b').get()).to.deep.equal([666, 777]);

      s.destroy();
    });

  });

  it('action', function () {
    const s = createStore({ a: 111, b: [111] });

    s.register('add', (store, action) => {
      store.field(action.name).add(action.number);
    });
    s.register('sub', (store, action) => {
      store.field(action.name).sub(action.number);
    });

    expect(() => s.dispatch({ type: 'hello' })).to.throws(/action type "hello" is undefined/);

    s.dispatch({ type: 'add', name: 'a', number: 10 });
    expect(s.field('a').get()).to.equal(121);
    s.dispatch({ type: 'sub', name: 'a', number: 22 });
    expect(s.field('a').get()).to.equal(99);

    expect(s.getState()).to.deep.equal({ a: 99, b: [111] });

    s.destroy();
  });

  it('middleware', function () {
    const s = createStore({ a: 111, b: [111] });

    const logs: any[] = [];
    const logs2: any[] = [];
    s.use(data => logs.push(data));
    s.use(data => logs2.push(data));

    s.register('incr', (store, action) => {
      store.field(action.name).sub(1);
    });

    s.dispatch({ type: 'incr', name: 'a'});
    s.field('a').add(20);
    s.setState({ a: 444, c: 456 });

    expect(logs).to.deep.equal(logs2);
    expect(logs).to.deep.equal([{
      type: 'CURRENT_STATE',
      payload: { state: { a: 111, b: [111] } },
    },
    { type: 'ACTION', payload: { type: 'incr', name: 'a' } },
    { type: 'SET_STATE', payload: { state: { a: 110 } } },
    {
      type: 'STATE_CHANGE',
      payload: { state: { a: 110 }, newState: { a: 110, b: [111] } },
    },
    { type: 'SET_STATE', payload: { state: { a: 130 } } },
    {
      type: 'STATE_CHANGE',
      payload: { state: { a: 130 }, newState: { a: 130, b: [111] } },
    },
    { type: 'SET_STATE', payload: { state: { a: 444, c: 456 } } },
    {
      type: 'STATE_CHANGE',
      payload:
      {
        state: { a: 444, c: 456 },
        newState: { a: 444, b: [111], c: 456 },
      },
    }]);
    expect(s.getState()).to.deep.equal({ a: 444, b: [111], c: 456 });

    s.destroy();
  });

});
