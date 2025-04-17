import { type NestedSpaceDTO } from 'transport/NestedSpaceDTO/NestedSpaceDTO';

export type ExclusionPanDTO<Pan> = { pick: Pan } | { omit: Pan };

export type ExclusionDTO<Pan> = NestedSpaceDTO<ExclusionPanDTO<Pan>>;
