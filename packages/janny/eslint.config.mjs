import { includeIgnoreFile } from '@eslint/compat';
import pluginJs from '@eslint/js';
import globals from 'globals';
import { resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  includeIgnoreFile(resolve(__dirname, '../../.gitignore')),
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-namespace': 0,
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-shadow': 2,
      '@typescript-eslint/no-empty-object-type': 0,
      '@typescript-eslint/no-unused-vars': [
        2,
        {
          caughtErrors: 'none',
        },
      ],
      'no-console': 'warn',
    },
  },
];
