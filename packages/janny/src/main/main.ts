import { convertToArgumentsMainFactory } from './convertToArguments';
import { convertToCasesMainFactory } from './convertToCases';
import { exclusionConverterFactory } from './exclusionConverter';
import { exclusionParserFactory } from './exclusionParser';
import {
  generateCasesFactory,
  type GenerateCasesFactoryOptions,
} from './generateCases';
import { optionsSuppliers } from './optionsSuppliers';
import { saveFileFactory, type SaveFileFactoryOptions } from './save';
import { spaceConverterFactory } from './spaceConverter';
import {
  type Case,
  type CaseDTOs,
  type CaseOutput,
  type ExclusionPanDTO,
  type Level,
  type Pan,
  type Space,
  type SpaceDTO,
  type SpacePanFactory,
  type UserExclusionDTOs,
} from './types';
import {
  type Arguments,
  conventionalCallFactory,
} from 'adapters/conventionalCall';
import { TokenValidator } from 'drivers/jenny/TokenValidator';
import { CaseGenerator } from 'features/CaseGenerator';
import invariant from 'invariant';
import { type JSONType } from 'transport/content/types';
import { type MatrixResultDTO } from 'transport/MatrixResultDTO/MatrixResultDTO';
import { parseMatrixResultDTO } from 'transport/MatrixResultDTO/parseMatrixResultDTO';
import { keepAndRetryPromiseFactory } from 'utils/keepAndRetryPromise/keepAndRetryPromise';
import { type KeysOfUnion } from 'utils/KeysOfUnion';

export namespace Main {
  interface Options<UserSpaceLike, CaseDTOOutput>
    extends Partial<CaseGenerator.Options<UserExclusionDTOs<UserSpaceLike>>>,
      Pick<GenerateCasesFactoryOptions<CaseDTOOutput>, 'mapOutput'>,
      SaveFileFactoryOptions {
    space: UserSpaceLike;
  }

  type ExclusionKeys = KeysOfUnion<ExclusionPanDTO>;

  type ExclusionPanFactory = Record<
    ExclusionKeys,
    <UserLevel extends Level>(
      ...levels: UserLevel[]
    ) => ExclusionPanDTO<Pan<UserLevel[]>>
  >;

  export interface OptionsSuppliers extends ExclusionPanFactory {
    pan: SpacePanFactory;
  }

  export interface OptionsFactory<UserSpaceLike, CaseDTOOutput> {
    (suppliers: OptionsSuppliers): Options<UserSpaceLike, CaseDTOOutput>;
  }
}

export class Main<
  UserSpaceLike extends SpaceDTO,
  CaseDTOOutput extends JSONType,
> implements CaseGenerator.CaseGenerator<CaseDTOs<CaseDTOOutput>>
{
  constructor(
    protected optionsFactory: Main.OptionsFactory<UserSpaceLike, CaseDTOOutput>,
  ) {}
  protected feature: CaseGenerator.CaseGenerator<
    CaseDTOs<CaseDTOOutput>
  > | null = null;
  protected keepAndRetryPromise =
    keepAndRetryPromiseFactory<Awaited<ReturnType<typeof this.init>>>();
  protected async init() {
    const managePromise = keepAndRetryPromiseFactory<void>();
    const options = {
      exclusions: [],
      ...this.optionsFactory(optionsSuppliers),
    };
    const { space: spaceDTO, exclusions: exclusionDTOs } = options;
    const spaceConverter = spaceConverterFactory();
    const space: Space = spaceConverter.toSpace(spaceDTO);
    const exclusionConverter = exclusionConverterFactory({
      spaceDTO,
      exclusionDTOs,
    });
    const toExclusions = exclusionParserFactory<UserSpaceLike>({
      converter: exclusionConverter,
    });
    const tokenValidator = new TokenValidator<Level>(space);
    const toArguments = convertToArgumentsMainFactory({
      converter: tokenValidator,
    });
    const call = conventionalCallFactory({
      name: 'jenny',
      parseResult: (result: string) =>
        parseMatrixResultDTO(result, {
          skipLines: 0,
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
      UserExclusionDTOs<UserSpaceLike>,
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
