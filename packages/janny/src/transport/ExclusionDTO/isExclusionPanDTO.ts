import { type ExclusionPanDTO } from './ExclusionDTO';
import invariant from 'invariant';
import { isObject } from 'lodash-es';
import { type IsPan } from 'transport/NestedSpaceDTO/SpaceConverter';

const notAPan = Symbol('notAPan');

export function isFactory<Pan>(isPan: (pan: unknown) => pan is Pan) {
  function assertExclusionPanDTO(
    ep: unknown,
  ): asserts ep is ExclusionPanDTO<Pan> {
    invariant(isObject(ep), 'Exclusion pan DTO is not an object');
    const pan = 'pick' in ep ? ep.pick : 'omit' in ep ? ep.omit : notAPan;
    invariant(isPan(pan), 'This is not a pan');
  }
  const isExclusionPanDTO = ((ep: unknown): ep is ExclusionPanDTO<Pan> => {
    try {
      assertExclusionPanDTO(ep);
      return true;
    } catch (e) {
      return false;
    }
  }) satisfies IsPan<ExclusionPanDTO<Pan>>;
  return {
    assertExclusionPanDTO,
    isExclusionPanDTO,
  };
}
