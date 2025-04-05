import { convertToRestrictionArgumentsFactory } from './convertToRestrictionArguments';
import invariant from 'invariant';
import { sortBy, uniq } from 'lodash-es';

describe('jenny', () => {
  describe('convertToRestrictionArguments', () => {
    async function arrangeAndAct() {
      const exclusionToCoordinatesMap = new Map([
        [
          new Map(),
          [
            { index: 0, cardinality: 7 },
            { index: 0, cardinality: 8 },
            { index: 1, cardinality: 0 },
          ],
        ],
        [new Map(), [{ index: 2, cardinality: 2 }]],
        [new Map(), []],
        [
          new Map(),
          [
            { index: 5, cardinality: 1 },
            { index: 2, cardinality: 1 },
            { index: 5, cardinality: 0 },
            { index: 2, cardinality: 1 },
          ],
        ],
      ]);
      const exclusions = [...exclusionToCoordinatesMap.keys()];
      const getCoordinates = jest.fn(
        (space: symbol, exclusion: Map<unknown, unknown>) => {
          const coordinates = exclusionToCoordinatesMap.get(exclusion);
          invariant(typeof coordinates !== 'undefined', 'Empty coordinates');
          return coordinates;
        },
      );
      const getTokenNumberByIndex = jest.fn().mockImplementation((index) => {
        const map = new Map([
          [0, '1'],
          [1, '2'],
          [2, '3'],
          [5, '6'],
        ]);
        return map.get(index);
      });
      const getTokenLetterByCardinality = jest
        .fn()
        .mockImplementation((cardinality) => {
          const map = new Map([
            [0, 'a'],
            [1, 'b'],
            [2, 'c'],
            [7, 'h'],
            [8, 'i'],
          ]);
          return map.get(cardinality);
        });
      const convert = convertToRestrictionArgumentsFactory({
        getCoordinates,
        getTokenNumberByIndex,
        getTokenLetterByCardinality,
      });
      const space = Symbol();
      const result = await convert({ space, exclusions });
      return {
        getCoordinates,
        getTokenNumberByIndex,
        getTokenLetterByCardinality,
        result,
        space,
      };
    }
    it.concurrent(
      'should pass "space" to each call of "getCoordinates"',
      async () => {
        const { space: expectedSpace, getCoordinates } = await arrangeAndAct();
        const spaces = new Set(
          getCoordinates.mock.calls.map(([space]) => space),
        );
        expect(spaces.size).toBe(1);
        spaces.add(expectedSpace);
        expect(spaces.size).toBe(1);
      },
    );
    it.concurrent(
      'should call "getCoordinates" once for each exclusion',
      async () => {
        const { getCoordinates } = await arrangeAndAct();
        expect(getCoordinates).toHaveBeenCalledTimes(4);
      },
    );
    it.concurrent(
      'should call "getTokenNumberByIndex" only with the indices given with exclusions',
      async () => {
        const { getTokenNumberByIndex } = await arrangeAndAct();
        expect(
          uniq(
            sortBy(getTokenNumberByIndex.mock.calls.map(([index]) => index)),
          ),
        ).toStrictEqual([0, 1, 2, 5]);
      },
    );
    it.concurrent(
      'should call "getTokenLetterByCardinality" only with the cardinalities given with exclusions',
      async () => {
        const { getTokenLetterByCardinality } = await arrangeAndAct();
        expect(
          uniq(
            sortBy(
              getTokenLetterByCardinality.mock.calls.map(
                ([cardinality]) => cardinality,
              ),
            ),
          ),
        ).toStrictEqual([0, 1, 2, 7, 8]);
      },
    );
    it.concurrent(
      'should return result assembled with returned tokens',
      async () => {
        const { result } = await arrangeAndAct();
        expect(result).toStrictEqual(['1hi2a', '3c', '3b6ab']);
      },
    );
  });
});
