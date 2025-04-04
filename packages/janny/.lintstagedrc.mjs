import {
  cspell,
  exclude,
  map as parentMap,
  prettier,
} from '../../.lintstagedrc.mjs';

const lint = 'pnpm lint --fix';

export const map = {
  ...parentMap,
  '*.{js,mjs,cjs,ts}': [cspell, lint, prettier],
};

export default {
  ...map,
  ...exclude(map),
};
