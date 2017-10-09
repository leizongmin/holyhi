import { expect } from 'chai';
import { createStore } from '../lib';

describe('holyhi', function () {

  it('no initial state', function () {
    const s = createStore();
    const ret: string[][] = [];
    const a = s.subscribe([], (fields) => {
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
    expect(() => s.setState({})).throws('Cannot read property \'get\' of undefined');
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
    const sall = s.subscribe([], fields => fall.push(fields));
    const sa = s.subscribe(['a'], fields => fa.push(fields));
    const sbc = s.subscribe(['b', 'c'], fields => fbc.push(fields));

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
      [ 'x' ],
      [ 'a' ],
      [ 'b' ],
      [ 'c' ],
      [ 'y', 'b' ],
    ]);
    expect(fa).to.deep.equal([
      [ 'a' ],
    ]);
    expect(fbc).to.deep.equal([
      [ 'b' ],
      [ 'c' ],
      [ 'y', 'b' ],
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
      [ 'x' ],
      [ 'a' ],
      [ 'b' ],
      [ 'c' ],
      [ 'y', 'b' ],
    ]);
    expect(fa).to.deep.equal([
      [ 'a' ],
      [ 'a', 'c' ],
    ]);
    expect(fbc).to.deep.equal([
      [ 'b' ],
      [ 'c' ],
      [ 'y', 'b' ],
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

      expect(ret).to.deep.equal([ 123, 666, 222 ]);
      expect(s.getState()).to.deep.equal({
        a: 222,
        b: 999,
        c: 789,
      });

      a.unsubscribe();
      s.destroy();
    });

    it('get / set', function () {
      const s = createStore({ a: 111 });

      expect(s.field('b').get()).to.equal(undefined);
      expect(s.field('b').set('hello').get()).to.equal('hello');
      expect(s.field('b').get()).to.equal('hello');

      expect(s.field('a').get()).to.equal(111);
      s.field('a').set(789);
      expect(s.field('a').get()).to.equal(789);

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

});
