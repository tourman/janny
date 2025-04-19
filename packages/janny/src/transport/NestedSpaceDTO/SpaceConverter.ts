import { FrozenMap } from './FrozenMap';
import type * as NestedSpaceConverter from './NestedSpaceConverter';
import { type NestedSpaceDTO } from './NestedSpaceDTO';
import type * as Entities from 'entities';
import { type CaseGenerator } from 'features/CaseGenerator';
import invariant from 'invariant';
import { cloneDeepWith, get, set } from 'lodash-es';

interface ToSpace<P, K, L> {
  toSpace: CaseGenerator.ToSpace<NestedSpaceDTO<P>, Entities.Space<K, L>>;
}

export interface IsPan<P> {
  (pan: unknown): pan is P;
}

export interface ExtractDimension<P, L> {
  (pan: P): Set<L>;
}

export interface PathToKey<K> {
  (path: (string | number)[]): K;
}

export interface KeyToPath<K> {
  (key: K): (string | number)[];
}

type Path = (string | number)[];

export interface ExtractPanEntries<P> {
  (nestedSpace: NestedSpaceDTO<P>): [Path, P][];
}

export class SpaceConverter<
    P,
    K extends { toString: () => string },
    L extends { toString: () => string },
  >
  implements
    NestedSpaceConverter.SpaceConverter<P, L, Entities.Space<K, L>>,
    ToSpace<P, K, L>
{
  constructor(
    protected isPan: IsPan<P>,
    protected extractDimension: ExtractDimension<P, L>,
    protected pathToKey: PathToKey<K>,
    protected keyToPath: KeyToPath<K>,
    protected extractPanEntries: ExtractPanEntries<P>,
  ) {}
  toSpace(
    this: SpaceConverter<P, K, L>,
    nestedSpace: NestedSpaceDTO<P>,
  ): Entities.Space<K, L> {
    const entries = this.extractPanEntries(nestedSpace);
    return new FrozenMap(
      entries.map(([path, pan]): [K, Set<L>] => [
        this.pathToKey(path),
        new Set(this.extractDimension(pan)),
      ]),
    );
  }
  fromSpace(
    this: SpaceConverter<P, K, L>,
    levelMap: Map<K, L>,
    nestedSpace: NestedSpaceDTO<P>,
    /**
     * Use `space` as a cache to speed the conversion up.
     */
    space?: Entities.Space<K, L>,
  ): NestedSpaceDTO<L> {
    const keys = new Set((space ?? this.toSpace(nestedSpace)).keys());
    const result = cloneDeepWith(nestedSpace, () => {}) as NestedSpaceDTO<L>;
    for (const [key, level] of levelMap.entries()) {
      const path = this.keyToPath(key);
      const pan = get(result, path);
      invariant(this.isPan(pan), `Key '${key}' does not seem to match pan`);
      const dimension = this.extractDimension(pan);
      invariant(
        dimension.has(level),
        `Key '${key}' contains unrecognized level '${level}'`,
      );
      set(result, path, level);
      keys.delete(key);
    }
    invariant(
      !keys.size,
      `Keys ${JSON.stringify([...keys])} are absent in the level map`,
    );
    return result;
  }
}
