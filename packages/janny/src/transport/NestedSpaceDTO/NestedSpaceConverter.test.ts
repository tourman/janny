import { LevelExtractor } from './LevelExtractor';
import { NestedSpaceConverter } from './NestedSpaceConverter';
import { SpaceConverter } from './SpaceConverter';
import invariant from 'invariant';
import { isNumber, isString, memoize } from 'lodash-es';

interface Pan {
  (): (string | number)[];
}

function isPan(pan: unknown): pan is Pan {
  return typeof pan === 'function';
}

const extractLevels = memoize((pan: Pan) => new Set(pan()));
extractLevels.cache = new WeakMap();

describe('NestedSpaceConverter', () => {
  describe('conversion', () => {
    function arrangeAndAct() {
      function pathToKey(path: (string | number)[]) {
        return JSON.stringify(path);
      }
      function keyToPath(key: string): (string | number)[] {
        const path = JSON.parse(key);
        invariant(
          Array.isArray(path) &&
            path.every((pathKey) => isString(pathKey) || isNumber(pathKey)),
          'Invalid keys in the path',
        );
        return path;
      }
      const nestedSpace = {
        a: [() => ['a0', 'a1'], 3],
        b: {
          c: () => ['c0', 'c1', 'c2'],
          d: [0, 1, 2],
          e: {
            f: () => ['f0'],
          },
        },
      };
      const converter = new NestedSpaceConverter(
        new SpaceConverter(isPan, extractLevels, pathToKey, keyToPath, () => [
          [['a', 0], nestedSpace.a[0] as Pan],
          [['b', 'c'], nestedSpace.b.c],
          [['b', 'e', 'f'], nestedSpace.b.e.f],
        ]),
        new LevelExtractor(isPan, extractLevels, keyToPath),
      );
      const space = converter.toSpace(nestedSpace);
      return { converter, space };
    }
    describe('forming space', () => {
      it.concurrent('should form space using the pans', () => {
        const { space } = arrangeAndAct();
        const entries = [...space.entries()].sort(([a], [b]) =>
          a > b ? 1 : -1,
        );
        expect(entries).toStrictEqual([
          ['["a",0]', new Set(['a0', 'a1'])],
          ['["b","c"]', new Set(['c0', 'c1', 'c2'])],
          ['["b","e","f"]', new Set(['f0'])],
        ]);
      });
      it.concurrent('should return a map that does not allow to add', () => {
        const { space } = arrangeAndAct();
        expect(() => space.set('', new Set())).toThrow();
      });
      it.concurrent('should return a map that does not allow to delete', () => {
        const { space } = arrangeAndAct();
        expect(() => space.delete('["a",0]')).toThrow();
      });
      it.concurrent('should return a map that does not allow to clear', () => {
        const { space } = arrangeAndAct();
        expect(() => space.clear()).toThrow();
      });
    });
    describe('forming nested space', () => {
      it.concurrent('should throw because of extra paths', () => {
        const { converter } = arrangeAndAct();
        expect(() =>
          converter.fromSpace(
            new Map([
              ['["a",0]', 'a1'],
              ['["a",1]', 'a1'],
              ['["b","c"]', 'c1'],
              ['["b","e","f"]', 'f0'],
            ]),
            {
              a: [() => ['a0', 'a1'], 3],
              b: {
                c: () => ['c0', 'c1', 'c2'],
                d: [0, 1, 2],
                e: {
                  f: () => ['f0'],
                },
              },
            },
          ),
        ).toThrow('Key \'["a",1]\' does not seem to match pan');
      });
      it.concurrent('should throw because of absent paths', () => {
        const { converter } = arrangeAndAct();
        expect(() =>
          converter.fromSpace(
            new Map([
              ['["b","c"]', 'c1'],
              ['["b","e","f"]', 'f0'],
            ]),
            {
              a: [() => ['a0', 'a1'], 3],
              b: {
                c: () => ['c0', 'c1', 'c2'],
                d: [0, 1, 2],
                e: {
                  f: () => ['f0'],
                },
              },
            },
          ),
        ).toThrow('Keys ["[\\"a\\",0]"] are absent in the level map');
      });
      it.concurrent('should throw because of invalid level', () => {
        const { converter } = arrangeAndAct();
        expect(() =>
          converter.fromSpace(
            new Map([
              ['["a",0]', 'a1'],
              ['["b","c"]', 'c3'],
              ['["b","e","f"]', 'f0'],
            ]),
            {
              a: [() => ['a0', 'a1'], 3],
              b: {
                c: () => ['c0', 'c1', 'c2'],
                d: [0, 1, 2],
                e: {
                  f: () => ['f0'],
                },
              },
            },
          ),
        ).toThrow('Key \'["b","c"]\' contains unrecognized level \'c3\'');
      });
      it.concurrent(
        'should return nested space with levels instead of pans',
        () => {
          const { converter } = arrangeAndAct();
          const result = converter.fromSpace(
            new Map([
              ['["a",0]', 'a1'],
              ['["b","c"]', 'c1'],
              ['["b","e","f"]', 'f0'],
            ]),
            {
              a: [() => ['a0', 'a1'], 3],
              b: {
                c: () => ['c0', 'c1', 'c2'],
                d: [0, 1, 2],
                e: {
                  f: () => ['f0'],
                },
              },
            },
          );
          expect(result).toStrictEqual({
            a: ['a1', 3],
            b: {
              c: 'c1',
              d: [0, 1, 2],
              e: {
                f: 'f0',
              },
            },
          });
        },
      );
    });
  });
  describe('extraction', () => {
    it.concurrent(
      'should extract levels as subdimensions from a subspace',
      () => {
        function pathToArray(path: (number | string)[]): string[] {
          return path.map((key) =>
            typeof key === 'string' ? key : key.toString(10),
          );
        }
        const pathToKey = memoize(pathToArray, (path) => JSON.stringify(path));
        function keyToPath(compoundKey: string[]) {
          return compoundKey.map((key) => {
            const num = parseInt(key, 10);
            return num.toString(10) === key ? num : key;
          });
        }
        const converter = new NestedSpaceConverter(
          new SpaceConverter(
            (value: unknown): value is string[] =>
              Array.isArray(value) && value.every(isString),
            (pan: string[]) => new Set(pan),
            pathToKey,
            keyToPath,
            () => [],
          ),
          new LevelExtractor(
            (value: unknown): value is string[] =>
              Array.isArray(value) && value.every(isString),
            (pan: string[]) => pan,
            keyToPath,
          ),
        );
        expect(
          converter.extractLevels(
            new Map([
              [pathToKey(['a', 0]), new Set(['a0', 'a1'])],
              [pathToKey(['b', 'c']), new Set(['c0', 'c1', 'c2'])],
              [pathToKey(['b', 'e', 'f']), new Set(['f0'])],
            ]),
            {
              a: [['a2', 'a1']],
              b: {
                c: ['c0'],
                e: {
                  f: [],
                },
              },
            },
          ),
        ).toStrictEqual(
          new Map([
            [pathToKey(['a', 0]), new Set(['a1'])],
            [pathToKey(['b', 'c']), new Set(['c0'])],
          ]),
        );
      },
    );
  });
});
