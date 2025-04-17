import { type ExclusionDTO, type ExclusionPanDTO } from './ExclusionDTO';
import type * as Entities from 'entities';
import { type CaseGenerator } from 'features/CaseGenerator';
import { type SpaceConverter } from 'transport/NestedSpaceDTO/NestedSpaceConverter';

export interface ToExclusionsFactoryOptions<Pan, Key, Level> {
  converter: Pick<
    SpaceConverter<ExclusionPanDTO<Pan>, Level, Entities.Space<Key, Level>>,
    'toSpace'
  >;
}

export function toExclusionsFactory<Pan, Key, Level>({
  converter,
}: ToExclusionsFactoryOptions<Pan, Key, Level>) {
  function toExclusion(
    exclusionDTO: ExclusionDTO<Pan>,
  ): Entities.Space<Key, Level> {
    return converter.toSpace(exclusionDTO);
  }
  function toExclusions(exclusionDTOs: Iterable<ExclusionDTO<Pan>>) {
    return [...exclusionDTOs].map(toExclusion);
  }
  const convert = toExclusions satisfies CaseGenerator.ToExclusions<
    Iterable<ExclusionDTO<Pan>>,
    Entities.Space<Key, Level>[]
  >;
  return convert;
}
