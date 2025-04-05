import type { CaseGenerator } from 'features/CaseGenerator';

type FilePath = string;

export interface SaveFactoryBasicOptions {
  /**
   * A full path to the file with the cases. `save` uses it as it's with no modification.
   */
  filePath: FilePath;
}

export interface SaveToFile<Content> {
  (filePath: FilePath, content: Content): void | Promise<void>;
}

export interface GetContent<Cases, Content> {
  (cases: Cases): Content | Promise<Content>;
}

export interface SaveFactoryOptions<Cases, Content>
  extends SaveFactoryBasicOptions {
  saveToFile: SaveToFile<Content>;
  getContent: GetContent<Cases, Content>;
}

export function saveFactory<Cases, Content>({
  filePath,
  saveToFile,
  getContent,
}: SaveFactoryOptions<Cases, Content>) {
  async function generateContentAndSave(cases: Cases) {
    const content = await getContent(cases);
    await saveToFile(filePath, content);
  }
  const save = generateContentAndSave satisfies CaseGenerator.Save<Cases>;
  return save;
}
