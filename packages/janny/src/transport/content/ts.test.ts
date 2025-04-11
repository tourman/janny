import { type JSONCases, stringifyTS } from './ts';

describe('stringifyTS', () => {
  it('should properly stringify undefined value', () => {
    const cases: JSONCases = [
      {
        name: 'test',
        value: undefined,
      },
    ];
    const result = stringifyTS(cases);
    expect(result).toBe('[{"name":"test","value":undefined}]');
  });
});
