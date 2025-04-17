import { extractExclusionPanDTODimensionFactory } from './extractExclusionPanDTODimension';
import { difference, intersection } from 'lodash-es';

describe('extractExclusionPanDTODimension', () => {
  describe('success flow', () => {
    const extract = extractExclusionPanDTODimensionFactory({
      panToSpaceDimension: () => ['a', 'b', 'c', 'd'],
      panToExclusionDimension: () => ['a', 'd'],
      intersect: (a, b) => intersection([...a], [...b]),
      subtract: (a, b) => difference([...a], [...b]),
    });
    it('should pick', async () => {
      const result = await extract({
        pick: null,
      });
      expect([...result]).toStrictEqual(['a', 'd']);
    });
    it('should omit', async () => {
      const result = await extract({
        omit: null,
      });
      expect([...result]).toStrictEqual(['b', 'c']);
    });
  });
  describe('error flow', () => {
    describe('unknown levels', () => {
      it('should throw', () => {
        const extract = extractExclusionPanDTODimensionFactory({
          panToSpaceDimension: () => ['a', 'b', 'c', 'd'],
          panToExclusionDimension: () => ['a', 'd', 'e'],
          intersect: (a, b) => intersection([...a], [...b]),
          subtract: (a, b) => difference([...a], [...b]),
        });
        expect(() => extract({ pick: null })).toThrow();
        expect(() => extract({ omit: null })).toThrow();
      });
    });
  });
});
