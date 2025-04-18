import invariant from 'invariant';
import { type KeyToPath } from 'transport/NestedSpaceDTO/SpaceConverter';

function convertKeyToPath(key: string): (number | string)[] {
  const path = JSON.parse(key);
  invariant(Array.isArray(path), 'Invalid key');
  invariant(
    path.every(
      (pathKey) => typeof pathKey === 'string' || typeof pathKey === 'number',
    ),
    'Invalid path keys',
  );
  return path;
}

export const keyToPath = convertKeyToPath satisfies KeyToPath<string>;
