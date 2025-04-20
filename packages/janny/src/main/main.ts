import { convertToArgumentsMainFactory } from './convertToArguments';
import { convertToCasesMainFactory } from './convertToCases';
import { exclusionConverterFactory } from './exclusionConverter';
import {
  generateCasesFactory,
  type GenerateCasesFactoryOptions,
} from './generateCases';
import { saveFileFactory, type SaveFileFactoryOptions } from './save';
import { spaceConverterFactory } from './spaceConverter';
import {
  type Case,
  type CaseDTOs,
  type CaseOutput,
  type ExclusionDTOs,
  idKey,
  type Level,
  type Pan,
  type Space,
  type SpaceDTO,
} from './types';
import {
  type Arguments,
  conventionalCallFactory,
} from 'adapters/conventionalCall';
import { TokenValidator } from 'drivers/jenny/TokenValidator';
import { CaseGenerator } from 'features/CaseGenerator';
import invariant from 'invariant';
import { type JSONType } from 'transport/content/types';
import { toExclusionsFactory } from 'transport/ExclusionDTO/toExclusions';
import { type MatrixResultDTO } from 'transport/MatrixResultDTO/MatrixResultDTO';
import { parseMatrixResultDTO } from 'transport/MatrixResultDTO/parseMatrixResultDTO';
import { keepAndRetryPromiseFactory } from 'utils/keepAndRetryPromise/keepAndRetryPromise';

interface MainOptions<CaseDTOOutput>
  extends Partial<CaseGenerator.Options<ExclusionDTOs>>,
    Pick<GenerateCasesFactoryOptions<CaseDTOOutput>, 'mapOutput'>,
    SaveFileFactoryOptions {
  space: (getPan: (...args: Level[]) => Pan) => SpaceDTO;
}

export class Main<CaseDTOOutput extends JSONType>
  implements CaseGenerator.CaseGenerator<CaseDTOs<CaseDTOOutput>>
{
  constructor(protected options: MainOptions<CaseDTOOutput>) {}
  protected feature: CaseGenerator.CaseGenerator<
    CaseDTOs<CaseDTOOutput>
  > | null = null;
  protected keepAndRetryPromise =
    keepAndRetryPromiseFactory<Awaited<ReturnType<typeof this.init>>>();
  protected async init() {
    const managePromise = keepAndRetryPromiseFactory<void>();
    const panFactory = (...levels: Level[]): Pan => {
      const pan = () => levels;
      pan[idKey] = true as const;
      return pan;
    };
    const options = { exclusions: [], ...this.options };
    const spaceDTO = options.space(panFactory);
    const spaceConverter = spaceConverterFactory();
    const space: Space = spaceConverter.toSpace(spaceDTO);
    const exclusionConverter = exclusionConverterFactory({
      spaceDTO,
      exclusionDTOs: options.exclusions,
    });
    const toExclusions = toExclusionsFactory({ converter: exclusionConverter });
    const tokenValidator = new TokenValidator<Level>(space);
    const toArguments = convertToArgumentsMainFactory({
      converter: tokenValidator,
    });
    const call = conventionalCallFactory({
      name: 'jenny',
      parseResult: (result: string) =>
        parseMatrixResultDTO(result, {
          skipLines: 1,
        }),
    });
    const resultToCases = convertToCasesMainFactory({
      validator: tokenValidator,
      getDefaultCaseOutput: <T>(_space: Space, input: T) => {
        invariant(space === _space, 'Space instance mismatch');
        return input;
      },
    });
    const fromCases = generateCasesFactory<CaseOutput, CaseDTOOutput>({
      spaceDTO,
      converter: spaceConverter,
      ...options,
    });
    const save = saveFileFactory<CaseDTOOutput>(options);
    this.feature = new CaseGenerator<
      Space,
      Iterable<Space>,
      Case,
      SpaceDTO,
      CaseDTOs<CaseDTOOutput>,
      ExclusionDTOs,
      Arguments,
      MatrixResultDTO
    >(
      spaceDTO,
      options,
      managePromise,
      () => space,
      toExclusions,
      toArguments,
      call,
      resultToCases,
      fromCases,
      save,
    );
  }
  protected getFeature() {
    const { feature } = this;
    invariant(feature, 'No feature initialized');
    return feature;
  }
  async prepare(): Promise<void> {
    await this.keepAndRetryPromise(() => this.init());
    return this.getFeature().prepare();
  }
  get cases() {
    return this.getFeature().cases;
  }
}
