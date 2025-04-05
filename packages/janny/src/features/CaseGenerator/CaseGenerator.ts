import type * as Entities from 'entities';
import invariant from 'invariant';

export namespace CaseGenerator {
  /**
   * Should keep a resolved and retry a rejected promises.
   */
  export interface ManagePromise<T> {
    (getPromise: () => Promise<T>): Promise<T>;
  }

  interface Mapper<I, O> {
    (input: I): O | Promise<O>;
  }

  export interface ToSpace<SpaceDTO, Space> extends Mapper<SpaceDTO, Space> {}

  export interface ToExclusions<ExclusionDTO, Exclusion>
    extends Mapper<ExclusionDTO, Exclusion> {}

  export interface Options<E> {
    exclusions: E;
  }

  export interface ToArgumentsOptions<Space, Exclusions> {
    space: Space;
    exclusions: Exclusions;
  }

  export interface ToArguments<Space, Exclusions, Arguments>
    extends Mapper<ToArgumentsOptions<Space, Exclusions>, Arguments> {}

  export interface Call<Arguments, Result> extends Mapper<Arguments, Result> {}

  export interface ResultToCasesOptions<Space, Result> {
    space: Space;
    result: Result;
  }

  export interface ResultToCases<Space, Result, Case>
    extends Mapper<ResultToCasesOptions<Space, Result>, Case[]> {}

  export interface FromCasesOptions<Case, Space, SpaceDTO> {
    cases: Iterable<Case>;
    space: Space;
    spaceDTO: SpaceDTO;
  }

  export interface FromCases<Case, CaseDTOs, Space, SpaceDTO>
    extends Mapper<FromCasesOptions<Case, Space, SpaceDTO>, CaseDTOs> {}

  export interface Save<CasesDTO> {
    (cases: CasesDTO): void | Promise<void>;
  }

  export interface Prepare {
    (): Promise<void>;
  }

  export interface CaseGenerator<Cases> {
    prepare: Prepare;
    cases: Cases;
  }
}

export class CaseGenerator<
  Space extends Entities.Space<unknown, unknown>,
  Exclusions extends Iterable<Space>,
  Case extends Entities.Case<unknown, unknown>,
  SpaceDTO,
  CaseDTOs extends Iterable<unknown>,
  ExclusionDTOs,
  Arguments,
  Result,
> implements CaseGenerator.CaseGenerator<CaseDTOs>
{
  constructor(
    protected spaceDTO: SpaceDTO,
    protected options: CaseGenerator.Options<ExclusionDTOs>,
    protected managePromise: CaseGenerator.ManagePromise<void>,
    protected toSpace: CaseGenerator.ToSpace<SpaceDTO, Space>,
    protected toExclusions: CaseGenerator.ToExclusions<
      ExclusionDTOs,
      Exclusions
    >,
    protected toArguments: CaseGenerator.ToArguments<
      Space,
      Exclusions,
      Arguments
    >,
    protected call: CaseGenerator.Call<Arguments, Result>,
    protected resultToCases: CaseGenerator.ResultToCases<Space, Result, Case>,
    protected fromCases: CaseGenerator.FromCases<
      Case,
      CaseDTOs,
      Space,
      SpaceDTO
    >,
    protected save: CaseGenerator.Save<CaseDTOs>,
  ) {}
  protected _cases: CaseDTOs | null = null;
  protected async generateAndSave(): Promise<void> {
    const { spaceDTO } = this;
    const { exclusions: exclusionsDTO } = this.options;
    const [space, exclusions] = await Promise.all([
      this.toSpace(spaceDTO),
      this.toExclusions(exclusionsDTO),
    ]);
    const args = await this.toArguments({ space, exclusions });
    const result = await this.call(args);
    const cases = await this.resultToCases({ space, result });
    const casesDTO = await this.fromCases({ cases, space, spaceDTO });
    await this.save(casesDTO);
    this._cases = casesDTO;
  }
  /**
   * 1. Converts combinations to a driver's arguments
   * 2. Calls with the arguments
   * 3. Converts the result to the cases
   * 4. Saves the cases
   */
  prepare(): Promise<void> {
    const { managePromise } = this;
    return managePromise(() => this.generateAndSave());
  }
  get cases(): CaseDTOs {
    const { _cases } = this;
    invariant(_cases !== null, 'Wait until the cases are ready');
    return _cases;
  }
}
