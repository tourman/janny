import { type ConvertToDimensionArguments } from './convertToArguments';
import type * as Entities from 'entities';

export function convertToDimensionArgumentsFactory<
  Space extends Entities.Space<unknown, unknown>,
>() {
  function convert(space: Space) {
    return [...space.values()].map((dimension) => dimension.size);
  }
  const convertToDimensionArguments =
    convert satisfies ConvertToDimensionArguments<Space>;
  return convertToDimensionArguments;
}
