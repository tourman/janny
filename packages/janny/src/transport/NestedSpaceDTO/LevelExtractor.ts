import type * as NestedSpaceConverter from './NestedSpaceConverter';
import { type NestedSpaceDTO } from './NestedSpaceDTO';
import type * as Entities from 'entities';
import { get } from 'lodash-es';

export class LevelExtractor<P, K, L>
  implements NestedSpaceConverter.LevelExtractor<P, Entities.Space<K, L>>
{
  constructor(
    protected isPan: (pan: unknown) => pan is P,
    protected extractDimension: (pan: P) => Iterable<L>,
    protected keyToPath: (key: K) => (string | number)[],
  ) {}
  protected intersection<T>(a: Iterable<T>, b: Iterable<T>): Set<T> {
    const from = new Set(a);
    return new Set([...b].filter((item) => from.has(item)));
  }
  extractLevels(
    space: Entities.Space<K, L>,
    nestedSubspace: NestedSpaceDTO<P>,
  ): Entities.Space<K, L> {
    const result: Entities.Space<K, L> = new Map();
    for (const [key, dimension] of space.entries()) {
      const path = this.keyToPath(key);
      const pan = get(nestedSubspace, path);
      if (!this.isPan(pan)) continue;
      const toConjunct = this.extractDimension(pan);
      const subdimension = this.intersection(dimension, toConjunct);
      if (!subdimension.size) continue;
      result.set(key, subdimension);
    }
    return result;
  }
}
