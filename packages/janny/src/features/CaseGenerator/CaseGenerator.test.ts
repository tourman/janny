import { CaseGenerator } from './CaseGenerator';

function caller<T>(fn: () => T): T {
  return fn();
}

describe('CaseGenerator', () => {
  it('should form proper generic types', () => {
    new CaseGenerator(
      { space: '' },
      { exclusions: [0, 1, 2] },
      caller,
      function toSpace() {
        return new Map([[3, new Set([null])]]);
      },
      function toExclusions() {
        return [new Map([[4, new Set([])]])];
      },
      function toArguments() {
        return ['a', 3];
      },
      function call() {
        return [['result']];
      },
      function resultToCases() {
        return [
          {
            input: Symbol(),
            output: 3,
          },
        ];
      },
      function fromCases() {
        return [];
      },
      function save() {},
    );
  });
});
