export const cspell = 'cspell';
export const prettier = 'prettier -wu';
export const sortPackageJson = 'sort-package-json';
export const vale = 'pnpm -w vale';

export const map = {
  'pnpm-lock.yaml': [],
  'package.json': [sortPackageJson, cspell, prettier],
};

export const exclude = (map, commands = [cspell, vale, prettier]) => {
  const key = `!(${Object.keys(map).join('|')})`;
  return { [key]: commands };
};

export default {
  ...map,
  ...exclude(map),
};
