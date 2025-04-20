import {
  type CaseDTOInput,
  type CaseInput,
  type Level,
  type Pan,
  type Space,
  type SpaceDTO,
} from './types';
import { toCaseDTOFactory } from 'transport/CaseDTO/toCaseDTO';
import { type SpaceConverter } from 'transport/NestedSpaceDTO/NestedSpaceConverter';

interface Map<I, O> {
  (input: I): O | Promise<O>;
}

export interface GenerateCaseConverter
  extends Pick<SpaceConverter<Pan, Level, Space>, 'fromSpace'> {}

export interface GenerateCasesFactoryOptions<CaseDTOOutput> {
  spaceDTO: SpaceDTO;
  converter: GenerateCaseConverter;
  mapOutput?: Map<CaseDTOInput, CaseDTOOutput>;
}

export function generateCasesFactory<CaseOutput, CaseDTOOutput = CaseDTOInput>({
  spaceDTO,
  converter,
  mapOutput,
}: GenerateCasesFactoryOptions<CaseDTOOutput>) {
  const toCases = toCaseDTOFactory<
    CaseInput,
    CaseOutput,
    CaseDTOInput,
    CaseDTOOutput
  >({
    toDTOInput: (entityInput) => converter.fromSpace(entityInput, spaceDTO),
    toDTOOutput: (entityOutput, dtoInput) =>
      typeof mapOutput === 'function'
        ? mapOutput(dtoInput)
        : (dtoInput as CaseDTOOutput),
  });
  return toCases;
}
