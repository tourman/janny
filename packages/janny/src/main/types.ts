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

export interface Pan<UserDimension = Dimension> {
  (): UserDimension;
  [idKey]: true;
}

export interface SpacePanFactory {
  <UserLevel extends Level>(...levels: UserLevel[]): Pan<UserLevel[]>;
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

export type ExclusionPanDTO<UserPan = Pan> = GenericExclusionPanDTO<UserPan>;

export type ExclusionDTO = GenericExclusionDTO<Pan>;

export type ExclusionDTOs = Iterable<ExclusionDTO>;

export type Case = Entities.Case<CaseInput, CaseOutput>;

type DefaultRecursionDepth = 5;

export type UserExclusionDTO<
  UserSpaceLike,
  Depth extends number = DefaultRecursionDepth,
  Depths extends unknown[] = [],
> = Depths['length'] extends Depth
  ? never
  : UserSpaceLike extends Pan<infer UserDimension>
    ? ExclusionPanDTO<Pan<UserDimension>>
    : UserSpaceLike extends unknown[] | object
      ? {
          [K in keyof UserSpaceLike]+?: UserExclusionDTO<
            UserSpaceLike[K],
            Depth,
            [0, ...Depths]
          >;
        }
      : never;

export type UserExclusionDTOs<UserSpaceLike> = Iterable<
  UserExclusionDTO<UserSpaceLike>
>;

export type UserSpaceDTO<
  UserSpaceLike,
  Depth extends number = DefaultRecursionDepth,
  Depths extends unknown[] = [],
> = Depths['length'] extends Depth
  ? never
  : [UserSpaceLike] extends [Level]
    ? UserSpaceLike | Pan<Iterable<UserSpaceLike>>
    : UserSpaceLike extends unknown[] | object
      ? {
          [K in keyof UserSpaceLike]: UserSpaceDTO<
            UserSpaceLike[K],
            Depth,
            [0, ...Depths]
          >;
        }
      : UserSpaceLike;
