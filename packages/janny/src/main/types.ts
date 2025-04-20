import type * as Entities from 'entities';
import { type NestedSpaceDTO } from 'transport/NestedSpaceDTO/NestedSpaceDTO';

export type Key = string;

export type Level = string | number;

export type Space = Entities.Space<Key, Level>;

export type LevelMap = Map<Key, Level>;

export type CaseInput = LevelMap;

export type CaseOutput = CaseInput;

export const idKey = Symbol('idKey');

export interface Pan {
  (): Level[];
  [idKey]: true;
}

export function isPan(pan: unknown): pan is Pan {
  return typeof pan === 'function' && idKey in pan && !!pan[idKey];
}

export type CaseDTOInput = NestedSpaceDTO<Level>;

export type SpaceDTO = NestedSpaceDTO<Pan>;
