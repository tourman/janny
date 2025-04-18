import { intersection } from 'lodash-es';
import { type Intersect } from 'transport/ExclusionDTO/extractExclusionPanDTODimension';

function makeIntersection<T>(a: Iterable<T>, b: Iterable<T>): Iterable<T> {
  return intersection([...a], [...b]);
}

export const intersect = makeIntersection satisfies Intersect;
