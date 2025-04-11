import { type SaveToFile } from 'adapters/save/save';
import { writeFile } from 'fs/promises';

type Data = Parameters<typeof writeFile>[1];

const writeFileWithDefaultEncoding: typeof writeFile = (
  file,
  data,
  options = 'utf8',
) => writeFile(file, data, options);

export const saveToFile =
  writeFileWithDefaultEncoding satisfies SaveToFile<Data>;
