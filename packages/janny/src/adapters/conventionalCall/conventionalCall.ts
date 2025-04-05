import { type CaseGenerator } from 'features/CaseGenerator';
import child_process from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(child_process.exec);

interface ConventionalCallFactoryBaseOptions {
  name: string;
}

interface ConventionalCallFactoryOptions<R>
  extends ConventionalCallFactoryBaseOptions {
  parseResult?: (stdout: string) => Promise<R> | R;
}

export type Arguments = { toString: () => string }[];

/**
 * to do: make sure it works with exit codes
 */
export function conventionalCallFactory(
  options: ConventionalCallFactoryBaseOptions,
): (args: Arguments) => Promise<string>;
export function conventionalCallFactory<R extends NonNullable<unknown>>(
  options: Required<ConventionalCallFactoryOptions<R>>,
): (args: Arguments) => Promise<R>;
export function conventionalCallFactory<R extends NonNullable<unknown>>({
  name,
  parseResult,
}: ConventionalCallFactoryOptions<R>): (
  args: Arguments,
) => Promise<string | R> {
  async function conventionalCall(args: Arguments) {
    const { stdout } = await exec(
      `${name} ${args.map((arg) => arg.toString()).join(' ')}`,
    );
    return parseResult?.(stdout) ?? stdout;
  }
  const call = conventionalCall satisfies CaseGenerator.Call<
    Arguments,
    string | R
  >;
  return call;
}
