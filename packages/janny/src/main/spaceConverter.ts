import { type GenerateCaseConverter } from './generateCases';
import { isPan, type Pan } from './types';
import { extractPanEntriesFactory } from 'transport/NestedSpaceDTO/extractPanEntries/extractPanEntries';
import { SpaceConverter } from 'transport/NestedSpaceDTO/SpaceConverter';
import { keyToPath } from 'utils/JSONPath/keyToPath';
import { pathToKey } from 'utils/JSONPath/pathToKey';

export function spaceConverterFactory() {
  const extractPanEntries = extractPanEntriesFactory(isPan);
  const converter = new SpaceConverter(
    isPan,
    (pan: Pan) => new Set(pan()),
    pathToKey,
    keyToPath,
    extractPanEntries,
  );
  return converter satisfies GenerateCaseConverter;
}
