import { Main } from './main';
import type * as Entities from 'entities';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';

interface State {
  a: 'aa' | 'AA';
  b: ['b0-0' | 'b0-1', number | null];
}

export type Case = Entities.Case<State, State>;

describe('main', () => {
  it('should save the cases into a TS file', async () => {
    const filePath = `/tmp/${Math.round(Math.random() * 0xffff)}_cases.ts`;
    await unlink(filePath).catch(() => {});
    const main = new Main({
      space: (pan) => ({
        a: pan('aa', 'AA'),
        b: [pan('b0-0', 'b0-1'), pan(0, 1, 2)],
      }),
      filePath,
      type: {
        path: 'main.test',
      },
    });
    await main.prepare();
    expect(existsSync(filePath)).toBe(true);
    // to do: file content
    // to do: expected cases
  });
});
