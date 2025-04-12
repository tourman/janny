import { type Space } from './types';
import { convertToArgumentsFactory } from 'drivers/jenny/convertToArguments';
import { convertToDimensionArgumentsFactory } from 'drivers/jenny/convertToDimensionArguments';
import { convertToRestrictionArgumentsFactory } from 'drivers/jenny/convertToRestrictionArguments';
import { type TokenConverter } from 'drivers/jenny/TokenConverter';
import { getCoordinatesFactory } from 'utils/getCoordinates/getCoordinates';

export interface ConvertToArgumentsMainFactoryOptions {
  converter: TokenConverter;
}

export function convertToArgumentsMainFactory({
  converter,
}: ConvertToArgumentsMainFactoryOptions) {
  const convertToDimensionArguments = convertToDimensionArgumentsFactory();
  const getCoordinates = getCoordinatesFactory();
  const convertToRestrictionArguments = convertToRestrictionArgumentsFactory<
    Space,
    Space
  >({
    getCoordinates,
    getTokenNumberByIndex: (index) => converter.fromIndex(index),
    getTokenLetterByCardinality: (cardinality) =>
      converter.fromCardinality(cardinality),
  });
  const convertToArguments = convertToArgumentsFactory({
    convertToDimensionArguments,
    convertToRestrictionArguments,
  });
  return convertToArguments;
}
