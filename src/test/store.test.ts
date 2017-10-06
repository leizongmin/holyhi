import { expect } from 'chai';
import { createStore } from '../lib';

describe('holyhi', function () {

  it('no initial state', function () {
    const s = createStore();
    const ret: string[][] = [];
    const a = s.allFields().subscribe((fields) => {
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
    const sall = s.allFields().subscribe(fields => fall.push(fields));
    const sa = s.forFields('a').subscribe(fields => fa.push(fields));
    const sbc = s.forFields('b', 'c').subscribe(fields => fbc.push(fields));

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

});
