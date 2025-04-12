import type * as Entities from 'entities';

export type Space = Entities.Space<
  string,
  string | number | null | undefined | symbol
>;
