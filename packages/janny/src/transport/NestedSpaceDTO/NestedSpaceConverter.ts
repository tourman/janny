import { type NestedSpaceDTO } from './NestedSpaceDTO';
import type * as Entities from 'entities';

export interface LevelExtractor<Pan, Space> {
  extractLevels(space: Space, nestedSubspace: NestedSpaceDTO<Pan>): Space;
}

export interface SpaceConverter<
  Pan,
  Level,
  Space extends Entities.Space<unknown, Level>,
> {
  toSpace(nestedSpace: NestedSpaceDTO<Pan>): Space;
  fromSpace(
    levelMap: Map<unknown, Level>,
    nestedSpace: NestedSpaceDTO<Pan>,
  ): NestedSpaceDTO<Level>;
}

export class NestedSpaceConverter<Pan, Key, Level>
  implements
    SpaceConverter<Pan, Level, Entities.Space<Key, Level>>,
    LevelExtractor<Pan, Entities.Space<Key, Level>>
{
  constructor(
    protected spaceConverter: SpaceConverter<
      Pan,
      Level,
      Entities.Space<Key, Level>
    >,
    protected levelExtractor: LevelExtractor<Pan, Entities.Space<Key, Level>>,
  ) {}
  extractLevels(
    space: Entities.Space<Key, Level>,
    nestedSubspace: NestedSpaceDTO<Pan>,
  ): Entities.Space<Key, Level> {
    return this.levelExtractor.extractLevels(space, nestedSubspace);
  }
  toSpace(nestedSpace: NestedSpaceDTO<Pan>): Entities.Space<Key, Level> {
    return this.spaceConverter.toSpace(nestedSpace);
  }
  fromSpace(
    levelMap: Map<unknown, Level>,
    nestedSpace: NestedSpaceDTO<Pan>,
  ): NestedSpaceDTO<Level> {
    return this.spaceConverter.fromSpace(levelMap, nestedSpace);
  }
}
