import type * as Entities from 'entities';
import { type CaseDTO as GenericCaseDTO } from 'transport/CaseDTO/CaseDTO';
import {
  type ExclusionDTO as GenericExclusionDTO,
  type ExclusionPanDTO as GenericExclusionPanDTO,
} from 'transport/ExclusionDTO/ExclusionDTO';
import { type NestedSpaceDTO } from 'transport/NestedSpaceDTO/NestedSpaceDTO';

export type Key = string;

export type Level = string | number;

export type Dimension = Iterable<Level>;

export type Space = Entities.Space<Key, Level>;

export type LevelMap = Map<Key, Level>;

export type CaseInput = LevelMap;

export type CaseOutput = CaseInput;

export const idKey = Symbol('idKey');

export interface Pan {
  (): Dimension;
  [idKey]: true;
}

export function isPan(pan: unknown): pan is Pan {
  return typeof pan === 'function' && idKey in pan && !!pan[idKey];
}

export type CaseDTOInput = NestedSpaceDTO<Level>;

export type SpaceDTO = NestedSpaceDTO<Pan>;

export type CaseDTO<CaseDTOOutput> = GenericCaseDTO<
  CaseDTOInput,
  CaseDTOOutput
>;

export type CaseDTOs<CaseDTOOutput> = Array<CaseDTO<CaseDTOOutput>>;

export type ExclusionPanDTO = GenericExclusionPanDTO<Pan>;

export type ExclusionDTO = GenericExclusionDTO<Pan>;

export type ExclusionDTOs = Iterable<ExclusionDTO>;
