import { Main } from './main';
import type * as Entities from 'entities';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import ts from 'typescript';

interface State {
  a: 'aa' | 'AA';
  b: ['b0-0' | 'b0-1', number | null];
}

export type Case = Entities.Case<State, State>;

function generateRandomFilePath(name: string) {
  return `/tmp/${Math.round(Math.random() * 0xffff)}_${name}`;
}

describe('main', () => {
  it('should save the cases into a TS file', async () => {
    const filePath = generateRandomFilePath('cases.ts');
    const typePath = generateRandomFilePath('type');
    await Promise.all([
      unlink(filePath).catch(() => {}),
      unlink(typePath).catch(() => {}),
    ]);
    // jenny 2 2 3 -w1a3a -w2b3b
    const main = new Main(({ pan, pick, omit }) => ({
      space: {
        a: pan('aa', 'AA'),
        b: [pan('b0-0', 'b0-1'), pan(0, 1, 2)],
      },
      exclusions: [
        {
          a: omit('AA'),
          // eslint-disable-next-line no-sparse-arrays
          b: [, pick(0)],
        },
        {
          b: [pick('b0-1'), omit(0, 2)],
        },
      ],
      filePath,
      type: {
        path: typePath,
      },
      mapOutput: () => null,
    }));
    await Promise.all([
      main.prepare(),
      writeFile(`${typePath}.ts`, 'export type Case = unknown', 'utf8'),
    ]);
    const tsContent = await readFile(filePath, 'utf8');
    const { outputText } = ts.transpileModule(tsContent, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    });
    const { cases } = ((): { cases: unknown } => {
      const exports: { cases: unknown } = { cases: {} };
      eval(outputText);
      return exports;
    })();
    expect(cases).toStrictEqual([
      {
        input: {
          a: 'aa',
          b: ['b0-0', 2],
        },
        _expected: null,
      },
      {
        input: {
          a: 'AA',
          b: ['b0-1', 0],
        },
        _expected: null,
      },
      {
        input: {
          a: 'AA',
          b: ['b0-0', 1],
        },
        _expected: null,
      },
      {
        input: {
          a: 'aa',
          b: ['b0-1', 2],
        },
        _expected: null,
      },
      {
        input: {
          a: 'aa',
          b: ['b0-0', 1],
        },
        _expected: null,
      },
      {
        input: {
          a: 'AA',
          b: ['b0-0', 2],
        },
        _expected: null,
      },
      {
        input: {
          a: 'AA',
          b: ['b0-0', 0],
        },
        _expected: null,
      },
    ]);
    // `expect(existsSync(filePath)).toBe(true);`
    // to do: file content
    // to do: expected cases
  });
});
