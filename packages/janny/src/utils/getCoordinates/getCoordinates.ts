import {
  type Coordinates,
  type GetCoordinates,
} from 'drivers/jenny/convertToRestrictionArguments';
import type * as Entities from 'entities';

function mapEntriesWithIndex<K, V>(
  map: Map<K, V>,
): { key: K; value: V; index: number }[] {
  return [...map.entries()].map(([key, value], index) => ({
    key,
    value,
    index,
  }));
}

function setWithIndex<T>(set: Set<T>): { value: T; index: number }[] {
  return [...set].map((value, index) => ({ value, index }));
}

export interface GetCoordinatesFactoryOptions {}

export function getCoordinatesFactory() {
  function get<
    SpaceKey,
    SpaceLevel,
    SubspaceKey extends SpaceKey,
    SubspaceLevel extends SpaceLevel,
  >(
    space: Entities.Space<SpaceKey, SpaceLevel>,
    subspace: Entities.Space<SubspaceKey, SubspaceLevel>,
  ) {
    const result: Coordinates[] = [];
    for (const { key, value: dimension, index } of mapEntriesWithIndex(space)) {
      for (const { value: level, index: cardinality } of setWithIndex(
        dimension,
      )) {
        if (subspace.get(key as SubspaceKey)?.has(level as SubspaceLevel)) {
          result.push({ index, cardinality });
        }
      }
    }
    return result;
  }
  const getCoordinates = get satisfies GetCoordinates<
    Entities.Space<unknown, unknown>,
    Entities.Space<unknown, unknown>
  >;
  return getCoordinates;
}
