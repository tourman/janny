import { type CaseDTOs } from './types';
import { saveToFile } from 'adapters/fs/saveToFile';
import { saveFactory, type SaveFactoryBasicOptions } from 'adapters/save/save';
import {
  generateFactory,
  type GenerateFactoryOptions,
  type JSONCases,
} from 'transport/content/ts';
import { type JSONType } from 'transport/content/types';

export interface SaveFileFactoryOptions
  extends SaveFactoryBasicOptions,
    GenerateFactoryOptions {}

export function saveFileFactory<CaseDTOOutput extends JSONType>(
  options: SaveFileFactoryOptions,
) {
  const getJSONContent = generateFactory(options);
  const getContent = (cases: CaseDTOs<CaseDTOOutput>) => {
    const jsonCases: JSONCases = cases.map((c) => ({ ...c }));
    return getJSONContent(jsonCases);
  };
  const save = saveFactory({
    ...options,
    saveToFile,
    getContent,
  });
  return save;
}
