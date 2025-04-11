import { type JSONType } from './types';
import { type GetContent } from 'adapters/save/save';
import invariant from 'invariant';

export type JSONCases = JSONType & object;

export interface GenerateFactoryOptions {
  type: {
    /**
     * A path in terms of TS which contains the case type
     * For instance `import { type Type } from 'path'`
     */
    path: string;
    /**
     * `Cases` by default
     */
    name?: string;
  };
}

function getPlaceholder(draft: string): string {
  let placeholder = '';
  do {
    placeholder = Math.random().toString(36).slice(2);
  } while (draft.includes(placeholder));
  return placeholder;
}

export function stringifyTS(cases: JSONCases): string {
  const draft = JSON.stringify(cases);
  const placeholder = getPlaceholder(draft);
  const result = JSON.stringify(cases, (key, value) => {
    if (value === undefined) {
      return placeholder;
    }
    return value;
  });
  return result.replaceAll(`"${placeholder}"`, 'undefined');
}

export function generateFactory({
  type: { path, name = 'Cases' },
}: GenerateFactoryOptions) {
  invariant(!/['"]/.test(path), 'Path should not contain quotes');
  invariant(
    /^[a-zA-Z_$][\w$]*$/.test(name),
    'Provide valid type for the cases',
  );
  function generate(cases: JSONCases): string {
    return [
      `import type { ${name} } from '${path}';`,
      `export const cases: ${name} = ${stringifyTS(cases)}`,
    ].join('\n\n');
  }
  const generateTypeScriptCases = generate satisfies GetContent<
    JSONCases,
    string
  >;
  return generateTypeScriptCases;
}
