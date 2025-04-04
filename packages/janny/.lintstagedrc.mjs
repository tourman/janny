import base, { redundant } from '../../.lintstagedrc.mjs';

export default {
  '*.{js,mjs,cjs,ts}': ['pnpm lint --fix', ...redundant],
  ...base,
};
