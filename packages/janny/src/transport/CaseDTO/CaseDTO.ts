type Flag = 'only' | 'skip';

interface BaseCaseDTO<Input> {
  input: Input;
  name?: string;
  flag?: Extract<keyof jest.Describe, Flag> & Extract<keyof jest.It, Flag>;
}

export type CaseDTO<Input, Output> = BaseCaseDTO<Input> &
  (
    | {
        expected: Output;
      }
    | {
        _expected: Output;
      }
  );
