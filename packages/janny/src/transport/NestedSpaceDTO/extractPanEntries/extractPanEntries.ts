import { isObject, range } from 'lodash-es';
import { type InnerNestedSpace } from 'transport/NestedSpaceDTO/NestedSpaceDTO';
import { type ExtractPanEntries } from 'transport/NestedSpaceDTO/SpaceConverter';

type Path = (string | number)[];

export function extractPanEntriesFactory<Pan>(
  isPan: (pan: unknown) => pan is Pan,
) {
  function getEntries<T>(
    obj: readonly T[] | Record<string, T>,
  ): [number | string, T][] {
    if (Array.isArray(obj)) {
      return range(obj.length).map((index) => [index, obj[index]]);
    } else {
      return Object.entries(obj);
    }
  }
  function extract(
    nestedSpace: InnerNestedSpace<Pan>,
    entries: [Path, Pan][] = [],
    path: Path = [],
  ): [Path, Pan][] {
    if (isPan(nestedSpace)) {
      entries.push([path, nestedSpace]);
      return entries;
    }
    if (isObject(nestedSpace)) {
      for (const [key, value] of getEntries(nestedSpace)) {
        extract(value, entries, [...path, key]);
      }
    }
    return entries;
  }
  const extractPanEntries = extract as ExtractPanEntries<Pan>;
  return extractPanEntries;
}
