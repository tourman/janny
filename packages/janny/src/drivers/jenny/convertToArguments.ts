import { type CaseGenerator } from 'features/CaseGenerator';

export interface ConvertToDimensionArguments<Space> {
  (space: Space): DimensionArgument[] | Promise<DimensionArgument[]>;
}

export interface ConvertToRestrictionArgumentsOptions<Space, Exclusions> {
  space: Space;
  exclusions: Exclusions;
}

export interface ConvertToRestrictionArguments<Space, Exclusions> {
  (
    options: ConvertToRestrictionArgumentsOptions<Space, Exclusions>,
  ): RestrictionArgument[] | Promise<RestrictionArgument[]>;
}

interface JennyFactoryOptions<Space, Exclusions> {
  convertToDimensionArguments: ConvertToDimensionArguments<Space>;
  convertToRestrictionArguments: ConvertToRestrictionArguments<
    Space,
    Exclusions
  >;
}

export type DimensionArgument = number;

export type RestrictionArgument = string;

type Arguments = (DimensionArgument | `-w${RestrictionArgument}`)[];

export function convertToArgumentsFactory<Space, Exclusions>({
  convertToDimensionArguments,
  convertToRestrictionArguments,
}: JennyFactoryOptions<Space, Exclusions>) {
  async function convertToArguments({
    space,
    exclusions,
  }: CaseGenerator.ToArgumentsOptions<Space, Exclusions>) {
    const [dimensionArguments, restrictionArguments] = await Promise.all([
      convertToDimensionArguments(space),
      convertToRestrictionArguments({
        space,
        exclusions,
      }),
    ]);
    return [
      ...dimensionArguments,
      ...restrictionArguments.map((token) => `-w${token}` as `-w${string}`),
    ];
  }
  const convert = convertToArguments satisfies CaseGenerator.ToArguments<
    Space,
    Exclusions,
    Arguments
  >;
  return convert;
}
