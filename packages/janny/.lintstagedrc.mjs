import base from '../../.lintstagedrc.mjs';

export default {
  '*.{js,mjs,cjs,ts}': ['pnpm lint --fix', 'prettier -wu'],
  ...base,
};
