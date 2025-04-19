import { type NestedSpaceDTO } from './NestedSpaceDTO';

export function isNestedSpaceDTO<P>(
  space: unknown,
  isPan: (pan: unknown) => pan is P,
): space is NestedSpaceDTO<P> {
  const seen = new Set<unknown>();

  function recurse(value: unknown): boolean {
    if (seen.has(value)) return false;
    seen.add(value);
    if (isPan(value)) return true;
    if (Array.isArray(value)) {
      return value.some(recurse);
    }
    if (value !== null && typeof value === 'object') {
      return Object.values(value).some(recurse);
    }
    return false;
  }

  if (Array.isArray(space) || (space !== null && typeof space === 'object')) {
    return recurse(space);
  }

  return false;
}
