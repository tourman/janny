import {
  cspell,
  exclude,
  map as parentMap,
  prettier,
  vale,
} from '../../.lintstagedrc.mjs';

const lint = 'pnpm lint --fix';

export const map = {
  ...parentMap,
  // vale supports only .ts and .js
  '*.{js,ts}': [cspell, vale, lint, prettier],
  '*.{mjs,cjs}': [cspell, lint, prettier],
};

export default {
  ...map,
  ...exclude(map),
};
