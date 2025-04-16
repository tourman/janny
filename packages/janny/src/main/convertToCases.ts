import {
  type CaseInput,
  type CaseOutput,
  type Key,
  type Level,
  type LevelMap,
  type Space,
} from './types';
import {
  convertMatrixResultToCasesFactory,
  type GetDefaultCaseOutput,
} from 'adapters/convertToCases/convertMatrixResultToCases';
import { reduceDimensionsToDefaultLevelMapFactory } from 'adapters/convertToCases/reduceDimensionsToDefaultLevelMap';
import { parseLineFactory } from 'drivers/jenny/lineToLevels';
import { TokenValidator } from 'drivers/jenny/TokenValidator';
import { identity } from 'lodash-es';

export interface ConvertToCasesMainFactoryOptions {
  getDefaultCaseOutput: GetDefaultCaseOutput<Space, CaseInput, CaseOutput>;
  validator: TokenValidator<Level>;
}

export function convertToCasesMainFactory({
  getDefaultCaseOutput,
  validator,
}: ConvertToCasesMainFactoryOptions) {
  const lineToLevels = parseLineFactory<Level>({
    Validator: TokenValidator,
  });
  const reduceDimensionsToDefaultLevelMap =
    reduceDimensionsToDefaultLevelMapFactory<Key, Level, Space>({
      lineToLevels,
    });
  const convertToCases = convertMatrixResultToCasesFactory<
    Space,
    CaseInput,
    CaseOutput,
    LevelMap
  >({
    assertResult: (result) => validator.assertMatrix(result),
    convertTupleToLevelMap: reduceDimensionsToDefaultLevelMap,
    getDefaultCaseOutput,
    convertToCaseInput: identity,
  });
  return convertToCases;
}
