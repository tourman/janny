import { type ConvertTupleToLevelMap } from './convertMatrixResultToCases';
import type * as Entities from 'entities';
import invariant from 'invariant';
import { zip } from 'lodash-es';

export interface LineToLevels<S, L> {
  (space: S, line: string[]): L[] | Promise<L[]>;
}

export interface ReduceDimensionsToDefaultLevelMapFactoryOptions<S, L> {
  lineToLevels: LineToLevels<S, L>;
}

export function reduceDimensionsToDefaultLevelMapFactory<
  K,
  L,
  S extends Entities.Space<K, L>,
>({ lineToLevels }: ReduceDimensionsToDefaultLevelMapFactoryOptions<S, L>) {
  type LevelMap = Map<K, L>;
  async function reduceDimensionsToDefaultLevelMap(
    space: S,
    line: string[],
  ): Promise<LevelMap> {
    const levels = await lineToLevels(space, line);
    invariant(space.size === levels.length, 'Level size mismatch');
    const keys = [...space.keys()];
    return new Map(zip(keys, levels) as [K, L][]);
  }
  const reduce =
    reduceDimensionsToDefaultLevelMap satisfies ConvertTupleToLevelMap<
      S,
      LevelMap
    >;
  return reduce;
}
