import { extractPanEntriesFactory } from './extractPanEntries';
import { isObject } from 'lodash-es';

interface Pan {
  thisIsPan: true;
}

describe('extractPanEntries', () => {
  it('should extract all nested paths', () => {
    const extract = extractPanEntriesFactory(
      (pan: unknown): pan is Pan =>
        isObject(pan) && 'thisIsPan' in pan && pan.thisIsPan === true,
    );
    expect(
      extract({
        a: { thisIsPan: true, rootKey: 'a' },
        b: [0, 1, { thisIsPan: true, rootKey: 'b' }],
        c: {
          d: [
            {
              e: { thisIsPan: true, rootKey: 'c' },
            },
          ],
        },
      }).sort(([a], [b]) => (JSON.stringify(a) > JSON.stringify(b) ? 1 : -1)),
    ).toStrictEqual([
      [['a'], { thisIsPan: true, rootKey: 'a' }],
      [['b', 2], { thisIsPan: true, rootKey: 'b' }],
      [['c', 'd', 0, 'e'], { thisIsPan: true, rootKey: 'c' }],
    ]);
  });
});
