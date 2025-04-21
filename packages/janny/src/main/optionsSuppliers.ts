import { type Main } from './main';
import { idKey } from './types';

export const optionsSuppliers: Main.OptionsSuppliers = {
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
};
