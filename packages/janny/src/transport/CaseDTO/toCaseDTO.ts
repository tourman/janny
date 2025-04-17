import { type CaseDTO } from './CaseDTO';
import type * as Entities from 'entities';
import { type CaseGenerator } from 'features/CaseGenerator';

interface ToCaseDTOFactoryOptions<
  EntityInput,
  EntityOutput,
  DTOInput,
  DTOOutput,
> {
  toDTOInput: (entityInput: EntityInput) => DTOInput | Promise<DTOInput>;
  toDTOOutput: (
    entityOutput: EntityOutput,
    dtoInput: DTOInput,
  ) => DTOOutput | Promise<DTOOutput>;
}

export interface ToCaseDTOsOptions<Case> {
  cases: Iterable<Case>;
}

export function toCaseDTOFactory<
  EntityInput,
  EntityOutput,
  DTOInput,
  DTOOutput,
>({
  toDTOInput,
  toDTOOutput,
}: ToCaseDTOFactoryOptions<EntityInput, EntityOutput, DTOInput, DTOOutput>) {
  async function toCaseDTO(
    caseEntity: Entities.Case<EntityInput, EntityOutput>,
  ): Promise<CaseDTO<DTOInput, DTOOutput>> {
    const { input: entityInput, output: entityOutput, name } = caseEntity;
    const dtoInput = await toDTOInput(entityInput);
    const dtoOutput = await toDTOOutput(entityOutput, dtoInput);
    return {
      input: dtoInput,
      _expected: dtoOutput,
      ...('name' in caseEntity ? { name } : {}),
    };
  }
  async function toCaseDTOs({
    cases,
  }: ToCaseDTOsOptions<Entities.Case<EntityInput, EntityOutput>>) {
    return Promise.all([...cases].map(toCaseDTO));
  }
  const toCases = toCaseDTOs satisfies CaseGenerator.FromCases<
    Entities.Case<EntityInput, EntityOutput>,
    Iterable<CaseDTO<DTOInput, DTOOutput>>,
    unknown,
    unknown
  >;
  return toCases;
}
