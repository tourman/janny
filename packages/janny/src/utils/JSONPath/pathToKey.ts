import { type PathToKey } from 'transport/NestedSpaceDTO/SpaceConverter';

function convertPathToKey(path: (string | number)[]): string {
  return JSON.stringify(path);
}

export const pathToKey = convertPathToKey satisfies PathToKey<string>;
