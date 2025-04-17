import { type ExclusionPanDTO } from './ExclusionDTO';
import invariant from 'invariant';
import { type ExtractDimension } from 'transport/NestedSpaceDTO/SpaceConverter';

interface Mapper<I, O> {
  (input: I): O;
}

interface PanToDimension<Pan, Dimension> extends Mapper<Pan, Dimension> {}

export interface PanToSpaceDimension<Pan, Dimension>
  extends PanToDimension<Pan, Dimension> {}

export interface PanToExclusionDimension<Pan, Dimension>
  extends PanToDimension<Pan, Dimension> {}

interface OperateIterable {
  <T>(a: Iterable<T>, b: Iterable<T>): Iterable<T>;
}

export interface Intersect extends OperateIterable {}

export interface Subtract extends OperateIterable {}

export interface ExtractExclusionPanDTODimensionFactoryOptions<Pan, Dimension> {
  panToSpaceDimension: PanToSpaceDimension<Pan, Dimension>;
  panToExclusionDimension: PanToSpaceDimension<Pan, Dimension>;
  intersect: Intersect;
  subtract: Subtract;
}

export function extractExclusionPanDTODimensionFactory<Pan, Level>({
  panToSpaceDimension,
  panToExclusionDimension,
  intersect,
  subtract,
}: ExtractExclusionPanDTODimensionFactoryOptions<Pan, Iterable<Level>>) {
  function extractExclusionPanDTODimension(
    ep: ExclusionPanDTO<Pan>,
  ): Set<Level> {
    const pan = 'pick' in ep ? ep.pick : ep.omit;
    const exclusionDimension = panToExclusionDimension(pan);
    const spaceDimension = panToSpaceDimension(pan);
    const dimension =
      'pick' in ep
        ? intersect(spaceDimension, exclusionDimension)
        : subtract(spaceDimension, exclusionDimension);
    const residual = subtract(exclusionDimension, spaceDimension);
    invariant(
      !new Set(residual).size,
      'Exclusion pan dimension contains unknown levels',
    );
    return new Set(dimension);
  }
  const extractDimension =
    extractExclusionPanDTODimension satisfies ExtractDimension<
      ExclusionPanDTO<Pan>,
      Level
    >;
  return extractDimension;
}
