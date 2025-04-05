import {
  type ConvertToRestrictionArguments,
  type ConvertToRestrictionArgumentsOptions,
} from './convertToArguments';
import { groupBy, sortBy } from 'lodash-es';

export interface Coordinates {
  index: number;
  cardinality: number;
}

export interface GetCoordinates<Space, Exclusion> {
  (space: Space, exclusion: Exclusion): Coordinates[] | Promise<Coordinates[]>;
}

export interface GetTokenNumberByIndex {
  (index: number): string;
}

export interface GetTokenLetterByCardinality {
  (cardinality: number): string;
}

export interface ConvertToRestrictionArgumentsFactoryOptions<Space, Exclusion> {
  getCoordinates: GetCoordinates<Space, Exclusion>;
  getTokenNumberByIndex: GetTokenNumberByIndex;
  getTokenLetterByCardinality: GetTokenLetterByCardinality;
}

function byUniqueness<T>(item: T, index: number, items: T[]): boolean {
  return index === items.indexOf(item);
}

export function convertToRestrictionArgumentsFactory<
  Space,
  Exclusion,
  Exclusions extends Iterable<Exclusion> = Iterable<Exclusion>,
>({
  getCoordinates,
  getTokenNumberByIndex,
  getTokenLetterByCardinality,
}: ConvertToRestrictionArgumentsFactoryOptions<Space, Exclusion>) {
  async function convertToRestrictionArguments({
    space,
    exclusions,
  }: ConvertToRestrictionArgumentsOptions<Space, Exclusions>) {
    const coordinates = await Promise.all(
      [...exclusions].map((exclusion) => getCoordinates(space, exclusion)),
    );
    return coordinates
      .filter((group) => group.length)
      .map((group) =>
        Object.entries(groupBy(group, 'index'))
          .map(
            ([index, cardinalitiesAsCoordinates]) =>
              `${getTokenNumberByIndex(parseInt(index))}${sortBy(
                cardinalitiesAsCoordinates,
                'cardinality',
              )
                .map(({ cardinality }) =>
                  getTokenLetterByCardinality(cardinality),
                )
                .filter(byUniqueness)
                .join('')}`,
          )
          .join(''),
      );
  }
  const convert =
    convertToRestrictionArguments satisfies ConvertToRestrictionArguments<
      Space,
      Exclusions
    >;
  return convert;
}
