import type * as Entities from 'entities';
import { type CaseGenerator } from 'features/CaseGenerator';
import { type MatrixResultDTO } from 'transport/MatrixResultDTO/MatrixResultDTO';

export interface AssertResult<Space> {
  (result: MatrixResultDTO, space: Space): asserts result is MatrixResultDTO;
}

export interface ConvertTupleToLevelMap<Space, LevelMap> {
  (space: Space, line: string[]): LevelMap | Promise<LevelMap>;
}

export interface ConvertToCaseInput<LevelMap, CaseInput> {
  (levelMap: LevelMap): CaseInput | Promise<CaseInput>;
}

export interface GetDefaultCaseOutput<Space, CaseInput, CaseOutput> {
  (space: Space, input: CaseInput): CaseOutput | Promise<CaseOutput>;
}

interface ConvertMatrixResultToCasesFactoryOptions<
  Space,
  CaseInput,
  CaseOutput,
  LevelMap,
> {
  assertResult: AssertResult<Space>;
  convertTupleToLevelMap: ConvertTupleToLevelMap<Space, LevelMap>;
  convertToCaseInput: ConvertToCaseInput<LevelMap, CaseInput>;
  getDefaultCaseOutput: GetDefaultCaseOutput<Space, CaseInput, CaseOutput>;
}

export function convertMatrixResultToCasesFactory<
  Space,
  CaseInput,
  CaseOutput,
  LevelMap,
>({
  convertTupleToLevelMap,
  convertToCaseInput,
  getDefaultCaseOutput,
  ...options
}: ConvertMatrixResultToCasesFactoryOptions<
  Space,
  CaseInput,
  CaseOutput,
  LevelMap
>) {
  async function convertMatrixResultToCases({
    space,
    result,
  }: CaseGenerator.ResultToCasesOptions<Space, MatrixResultDTO>) {
    const assertResult: typeof options.assertResult = options.assertResult;
    assertResult(result, space);
    return Promise.all(
      result.map(async (line) => {
        const levelMap = await convertTupleToLevelMap(space, line);
        const input = await convertToCaseInput(levelMap);
        const output = await getDefaultCaseOutput(space, input);
        return { input, output };
      }),
    );
  }
  const convertToCases =
    convertMatrixResultToCases satisfies CaseGenerator.ResultToCases<
      Space,
      MatrixResultDTO,
      Entities.Case<CaseInput, CaseOutput>
    >;
  return convertToCases;
}
