import {
  type ExclusionDTOs,
  type Key,
  type Level,
  type Pan,
  type SpaceDTO,
  type UserExclusionDTOs,
} from './types';
import {
  toExclusionsFactory,
  type ToExclusionsFactoryOptions,
} from 'transport/ExclusionDTO/toExclusions';

interface ExclusionParserFactoryOptions
  extends ToExclusionsFactoryOptions<Pan, Key, Level> {}

export function exclusionParserFactory<UserSpaceLike extends SpaceDTO>(
  options: ExclusionParserFactoryOptions,
) {
  const toExclusions = toExclusionsFactory<Pan, Key, Level>(options);
  function exclusionParser(
    userExclusionDTOs: UserExclusionDTOs<UserSpaceLike>,
  ) {
    const exclusionDTOs: ExclusionDTOs = userExclusionDTOs;
    return toExclusions(exclusionDTOs);
  }
  return exclusionParser;
}
