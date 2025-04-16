import { TokenValidator } from './TokenValidator';

describe('jenny', () => {
  describe('TokenValidator', () => {
    describe('assertToken', () => {
      const validator = new TokenValidator(
        new Map([
          ['a', new Set([0, 1, 2])],
          ['b', new Set([20, 21, 22, 23])],
        ]),
      );
      describe('value of 0', () => {
        it('should not throw', () => {
          expect(() => validator.assertToken('1a', 0)).not.toThrow();
        });
      });
      describe('cardinality is out of range', () => {
        it('should throw', () => {
          expect(() => validator.assertToken('2e', 1)).toThrow(
            'Token "2e" has cardinality out of place',
          );
        });
      });
      describe('index is out of range', () => {
        it('should throw', () => {
          expect(() => validator.assertToken('3a', 2)).toThrow('Invalid index');
        });
      });
      describe('last cardinality', () => {
        it('should not throw', () => {
          expect(() => validator.assertToken('2d', 1)).not.toThrow();
        });
      });
    });
  });
});
