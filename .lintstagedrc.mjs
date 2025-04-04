export const redundant = ['cspell --gitignore', 'prettier -wu'];

export default {
  '*': redundant,
  'package.json': ['sort-package-json', ...redundant],
};
