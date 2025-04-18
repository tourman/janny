import { difference } from 'lodash-es';
import { type Subtract } from 'transport/ExclusionDTO/extractExclusionPanDTODimension';

function makeSubtraction<T>(a: Iterable<T>, b: Iterable<T>): Iterable<T> {
  return difference([...a], [...b]);
}

export const subtract = makeSubtraction satisfies Subtract;
