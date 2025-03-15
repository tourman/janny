export default {
  '*': ['prettier -wu'],
  'package.json': ['sort-package-json', 'prettier -wu'],
};
