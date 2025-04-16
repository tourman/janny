import { type TokenValidator } from './TokenValidator';
import { type LineToLevels } from 'adapters/convertToCases/reduceDimensionsToDefaultLevelMap';
import type * as Entities from 'entities';
import invariant from 'invariant';

export interface Validator<L extends {}> {
  getInstance: (space: Entities.Space<unknown, L>) => TokenValidator<L>;
}

interface ParseLineFactoryOptions<L extends {}> {
  Validator: Validator<L>;
}

export function parseLineFactory<L extends {}>({
  Validator,
}: ParseLineFactoryOptions<L>) {
  function parseLine(space: Entities.Space<unknown, L>, line: string[]) {
    const validator: TokenValidator<L> = Validator.getInstance(space);
    validator.assertLine(line);
    const spaceMatrix = validator.getSpaceMatrix();
    return line
      .map((token) => validator.toCoordinates(token))
      .map(([, cardinality], index) => {
        const level = spaceMatrix.at(index)?.at(cardinality);
        invariant(typeof level !== 'undefined', 'Level is empty');
        return level;
      });
  }
  const lineToLevels = parseLine satisfies LineToLevels<
    Entities.Space<unknown, L>,
    L
  >;
  return lineToLevels;
}
