import { PanToDimension } from './PanToDimension';
import { get } from 'lodash-es';
import { type ExclusionPanDTO } from 'transport/ExclusionDTO/ExclusionDTO';

describe('PanToDimension', () => {
  const space = {
    a: () => ['a0', 'a1', 'a2'],
    b: ['b0', 'b1'],
    c: [() => ['c0', 'c1']],
  };
  const panMap = {
    a: () => ['a0'],
    c: () => ['c1'],
  };
  type PanMap = typeof panMap;
  type Pan = PanMap[keyof PanMap];
  const exclusionMap: Record<string, ExclusionPanDTO<Pan>> = {
    a: { pick: panMap.a },
    c: { omit: panMap.c },
  };
  const exclusions = [
    {
      a: exclusionMap.a,
      c: null,
    },
    {
      a: null,
      c: [exclusionMap.c],
    },
  ];
  const toExclusionPanMap = jest.fn().mockReturnValue(
    new Map([
      [exclusionMap.a, [0, 'a']],
      [exclusionMap.c, [1, 'c', 0]],
    ]),
  );
  const converter = new PanToDimension(
    space,
    exclusions,
    toExclusionPanMap,
    (pan: () => string[]) => pan(),
    (exclusionPan) =>
      'pick' in exclusionPan ? exclusionPan.pick : exclusionPan.omit,
    get,
  );
  it('should return dimension "a"', () => {
    expect(converter.panToSpaceDimension(panMap.a)).toStrictEqual([
      'a0',
      'a1',
      'a2',
    ]);
  });
  it('should return dimension "c"', () => {
    expect(converter.panToSpaceDimension(panMap.c)).toStrictEqual(['c0', 'c1']);
  });
});
