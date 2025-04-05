import { type MatrixResultDTO } from './MatrixResultDTO';
import invariant from 'invariant';

export function assertMatrixResultDTO(
  r: unknown,
): asserts r is MatrixResultDTO {
  invariant(Array.isArray(r), 'Result is not an array');
  invariant(
    r.every((line) => Array.isArray(line)),
    'Result is not a matrix',
  );
  invariant(
    r.every((line) => line.every((v) => typeof v === 'string')),
    'Result is not a matrix of strings',
  );
}
