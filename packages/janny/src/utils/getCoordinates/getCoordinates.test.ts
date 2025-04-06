import { getCoordinatesFactory } from './getCoordinates';

describe('getCoordinates', () => {
  it.concurrent('should extract proper coordinates', () => {
    const getCoordinates = getCoordinatesFactory();
    expect(
      getCoordinates(
        new Map([
          ['a', new Set(['a1', 'a2', 'a3'])],
          ['b', new Set(['b1', 'b2', 'b3'])],
          ['c', new Set(['c1', 'c2'])],
        ]),
        new Map([
          ['a', new Set(['a1', 'a3'])],
          ['b', new Set(['b1'])],
          ['c', new Set(['c2'])],
        ]),
      ),
    ).toStrictEqual([
      { index: 0, cardinality: 0 },
      { index: 0, cardinality: 2 },
      { index: 1, cardinality: 0 },
      { index: 2, cardinality: 1 },
    ]);
  });
  it.concurrent('should ignore extra dimension and levels', () => {
    const getCoordinates = getCoordinatesFactory();
    expect(
      getCoordinates(
        new Map([
          ['a', new Set(['a1', 'a2', 'a3'])],
          ['b', new Set(['b1', 'b2', 'b3'])],
          ['c', new Set(['c1', 'c2'])],
        ]),
        new Map([
          ['a', new Set(['a1', 'a3', 'a4'])],
          ['d', new Set(['d2'])],
        ]),
      ),
    ).toStrictEqual([
      { index: 0, cardinality: 0 },
      { index: 0, cardinality: 2 },
    ]);
  });
  it.concurrent('should return an empty array', () => {
    const getCoordinates = getCoordinatesFactory();
    expect(
      getCoordinates(
        new Map([
          ['a', new Set(['a1', 'a2', 'a3'])],
          ['b', new Set(['b1', 'b2', 'b3'])],
          ['c', new Set(['c1', 'c2'])],
        ]),
        new Map([['d', new Set(['d2'])]]),
      ),
    ).toStrictEqual([]);
  });
});
