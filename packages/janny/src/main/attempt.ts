import {
  type ExclusionDTOs,
  idKey,
  type Level,
  type Pan,
  type SpaceDTO,
} from './types';
import { type ExclusionPanDTO } from 'transport/ExclusionDTO/ExclusionDTO';
import { type KeysOfUnion } from 'utils/KeysOfUnion';

type DefaultRecursionDepth = 3;

type ToExclusionDTO<
  UserSpace,
  Depth extends number = DefaultRecursionDepth,
  Depths extends unknown[] = [],
> = Depths['length'] extends Depth
  ? never
  : UserSpace extends Pan<infer D>
    ? ExclusionPanDTO<Pan<D>>
    : UserSpace extends unknown[] | object
      ? {
          [K in keyof UserSpace]+?: ToExclusionDTO<
            UserSpace[K],
            Depth,
            [0, ...Depths]
          >;
        }
      : never;

interface SpacePanFactory {
  <UserLevel extends Level>(...levels: UserLevel[]): Pan<UserLevel[]>;
}

type ExclusionKeys = KeysOfUnion<ExclusionPanDTO<unknown>>;

interface AttemptConfigFactory extends ExclusionPanFactory {
  pan: SpacePanFactory;
}

type ExclusionPanFactory = Record<
  ExclusionKeys,
  <UserLevel extends Level>(
    ...levels: UserLevel[]
  ) => ExclusionPanDTO<Pan<UserLevel[]>>
>;

interface Settings<UserSpace> {
  space: UserSpace;
  exclusions: Iterable<ToExclusionDTO<UserSpace>>;
}

class Attempt<UserSpace extends SpaceDTO> {
  constructor(
    protected configFactory: (
      configSupplier: AttemptConfigFactory,
    ) => Settings<UserSpace>,
  ) {
    const { space, exclusions } = configFactory({
      pan: (...levels) =>
        Object.assign(() => levels, {
          [idKey]: true as const,
        }),
      pick: (...levels) => ({
        pick: Object.assign(() => levels, {
          [idKey]: true as const,
        }),
      }),
      omit: (...levels) => ({
        omit: Object.assign(() => levels, {
          [idKey]: true as const,
        }),
      }),
    });
    this.space = space;
    this.exclusions = exclusions;
  }
  public space: UserSpace;
  public exclusions: ExclusionDTOs;
}

export interface State {
  a: 'aa' | 'AA';
  b: ['b0-0' | 'b0-1', 0 | 1 | 2];
  c: 'cc' | 'CC';
}

export type ToSpaceDTO<
  UserSpace,
  Depth extends number = DefaultRecursionDepth,
  Depths extends unknown[] = [],
> = Depths['length'] extends Depth
  ? never
  : [UserSpace] extends [Level]
    ? UserSpace | Pan<Iterable<UserSpace>>
    : UserSpace extends unknown[] | object
      ? {
          [K in keyof UserSpace]: ToSpaceDTO<
            UserSpace[K],
            Depth,
            [0, ...Depths]
          >;
        }
      : UserSpace;

new Attempt(({ pan, pick }) => ({
  space: {
    a: pan('aa', 'AA'),
    b: [pan('b0-0', 'b0-1'), pan(0, 1, 2)],
    c: 'cc',
  }, // satisfies ToSpaceDTO<State>,
  exclusions: [
    {
      a: pick('aa'),
      // eslint-disable-next-line no-sparse-arrays
      b: [, pick(0)], // as const,
    },
  ],
}));
