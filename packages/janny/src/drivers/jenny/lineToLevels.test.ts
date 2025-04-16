import { parseLineFactory } from './lineToLevels';
import { TokenValidator } from './TokenValidator';

describe('jenny', () => {
  const space = new Map([
    ['a', new Set(['a1', 'a2', 'a3'])],
    ['b', new Set([0, 'b2', 'b3'])],
    ['c', new Set(['c1', '', 'c3'])],
  ]);
  describe('lineToLevels', () => {
    it('should return levels according to token line', () => {
      const lineToLevels = parseLineFactory({
        Validator: TokenValidator,
      });
      expect(lineToLevels(space, ['1c', '2a', '3b'])).toStrictEqual([
        'a3',
        0,
        '',
      ]);
    });
    describe('when line length (4) does not match space size (3)', () => {
      it('should throw', () => {
        const lineToLevels = parseLineFactory({
          Validator: TokenValidator,
        });
        expect(() => lineToLevels(space, ['1a', '2b', '3c', '4d'])).toThrow(
          'Mismatch between space size and line input',
        );
      });
    });
    describe('when index does not match', () => {
      it('should throw', () => {
        const lineToLevels = parseLineFactory({
          Validator: TokenValidator,
        });
        expect(() => lineToLevels(space, ['1a', '2b', '4c'])).toThrow(
          'Token "4c" is out of place',
        );
      });
    });
    describe('when cardinality is more that dimension length', () => {
      it('should throw', () => {
        const lineToLevels = parseLineFactory({
          Validator: TokenValidator,
        });
        expect(() => lineToLevels(space, ['1a', '2z', '3c'])).toThrow(
          'Token "2z" has cardinality out of place',
        );
      });
    });
  });
});
