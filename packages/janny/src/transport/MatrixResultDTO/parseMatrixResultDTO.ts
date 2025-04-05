import { type MatrixResultDTO } from './MatrixResultDTO';

export interface ParseMatrixResultDTOOptions {
  skipLines?: number;
}

export function parseMatrixResultDTO(
  raw: string,
  options?: ParseMatrixResultDTOOptions,
): MatrixResultDTO {
  const { skipLines } = { skipLines: 0, ...options };
  return raw
    .trim()
    .split('\n')
    .filter((line) => line.length)
    .slice(skipLines)
    .map((line) => line.trim().split(/\s+/));
}
