import { TokenConverter } from './TokenConverter';

describe('jenny', () => {
  describe('TokenConverter', () => {
    const converter = new TokenConverter();
    describe('toCoordinates', () => {
      let toIndex: jest.SpyInstance;
      let toCardinality: jest.SpyInstance;
      beforeEach(() => {
        toIndex = jest.spyOn(converter, 'toIndex');
        toCardinality = jest.spyOn(converter, 'toCardinality');
      });
      afterEach(() => {
        jest.restoreAllMocks();
      });
      it('should pass number token to "toIndex"', () => {
        converter.toCoordinates('3c');
        expect(toIndex.mock.calls[0][0]).toBe('3');
      });
      it('should pass letter token to "toCardinality"', () => {
        converter.toCoordinates('4A');
        expect(toCardinality.mock.calls[0][0]).toBe('A');
      });
      it('should throw for "--"', () => {
        expect(() => converter.toCoordinates('--')).toThrow(
          'Invalid token "--"',
        );
      });
      it('should throw for " 2a"', () => {
        expect(() => converter.toCoordinates(' 2a')).toThrow(
          'Invalid token " 2a"',
        );
      });
      it('should throw for "b4"', () => {
        expect(() => converter.toCoordinates('b4')).toThrow(
          'Invalid token "b4"',
        );
      });
      it('should return combined coordinates', () => {
        toIndex.mockReturnValue(-1);
        toCardinality.mockReturnValue(-2);
        expect(converter.toCoordinates('1a')).toStrictEqual([-1, -2]);
      });
      it('should return [1, 2] for "2c"', () => {
        expect(converter.toCoordinates('2c')).toStrictEqual([1, 2]);
      });
    });
    describe('toIndex', () => {
      it('should return 0 for token number "1"', () => {
        expect(converter.toIndex('1')).toBe(0);
      });
      it('should return 1 for token number "2"', () => {
        expect(converter.toIndex('2')).toBe(1);
      });
      it('should throw an error for token number "0"', () => {
        expect(() => converter.toIndex('0')).toThrow(
          'Token number must be a positive integer starting from 1',
        );
      });
      it('should throw an error for token number "02"', () => {
        expect(() => converter.toIndex('02')).toThrow(
          'Token number must be a positive integer starting from 1',
        );
      });
      it('should throw an error for non-numeric token number "a"', () => {
        expect(() => converter.toIndex('a')).toThrow(
          'Token number must be a positive integer starting from 1',
        );
      });
      it('should throw an error for empty string', () => {
        expect(() => converter.toIndex('')).toThrow(
          'Token number must be a positive integer starting from 1',
        );
      });
      it('should throw an error for negative number "-3"', () => {
        expect(() => converter.toIndex('-3')).toThrow(
          'Token number must be a positive integer starting from 1',
        );
      });
      it('should throw an error for decimal number "1.5"', () => {
        expect(() => converter.toIndex('1.5')).toThrow(
          'Token number must be a positive integer starting from 1',
        );
      });
    });
    describe('toCardinality', () => {
      it('should return 0 for token letter "a"', () => {
        expect(converter.toCardinality('a')).toBe(0);
      });
      it('should return 1 for token letter "b"', () => {
        expect(converter.toCardinality('b')).toBe(1);
      });
      it('should return 26 for token letter "A"', () => {
        expect(converter.toCardinality('A')).toBe(26);
      });
      it('should return 51 for token letter "Z"', () => {
        expect(converter.toCardinality('Z')).toBe(51);
      });
      it('should throw an error for wrong character "*"', () => {
        expect(() => converter.toCardinality('*')).toThrow(
          'Invalid character: must be a-z or A-Z',
        );
      });
      it('should throw an error when token letter has length 0', () => {
        expect(() => converter.toCardinality('')).toThrow(
          'Token letter must be exactly one character',
        );
      });
      it('should throw an error when token letter has length more than 1', () => {
        expect(() => converter.toCardinality('ab')).toThrow(
          'Token letter must be exactly one character',
        );
      });
    });
    describe('fromCoordinates', () => {
      let fromIndex: jest.SpyInstance;
      let fromCardinality: jest.SpyInstance;
      beforeEach(() => {
        fromIndex = jest.spyOn(converter, 'fromIndex');
        fromCardinality = jest.spyOn(converter, 'fromCardinality');
      });
      afterEach(() => {
        jest.restoreAllMocks();
      });
      it('should pass index to "fromIndex"', () => {
        converter.fromCoordinates(3, 9);
        expect(fromIndex.mock.calls[0][0]).toBe(3);
      });
      it('should pass cardinality to "fromCardinality"', () => {
        converter.fromCoordinates(2, 5);
        expect(fromCardinality.mock.calls[0][0]).toBe(5);
      });
      it('should return combined token', () => {
        fromIndex.mockReturnValue('IN');
        fromCardinality.mockReturnValue('CA');
        expect(converter.fromCoordinates(0, 0)).toBe('INCA');
      });
      it('should return "4e" for [3, 4]', () => {
        expect(converter.fromCoordinates(3, 4)).toBe('4e');
      });
    });
    describe('fromIndex', () => {
      it('should return "1" for index 0', () => {
        expect(converter.fromIndex(0)).toBe('1');
      });
      it('should return "2" for index 1', () => {
        expect(converter.fromIndex(1)).toBe('2');
      });
      it('should return "11" for index 10', () => {
        expect(converter.fromIndex(10)).toBe('11');
      });
      it('should throw for negative index', () => {
        expect(() => converter.fromIndex(-1)).toThrow();
      });
      it('should throw for non-integer index', () => {
        expect(() => converter.fromIndex(3.1415)).toThrow();
      });
    });
    describe('fromCardinality', () => {
      it('should return "a" for cardinality 0', () => {
        expect(converter.fromCardinality(0)).toBe('a');
      });
      it('should return "b" for cardinality 1', () => {
        expect(converter.fromCardinality(1)).toBe('b');
      });
      it('should return "z" for cardinality 25', () => {
        expect(converter.fromCardinality(25)).toBe('z');
      });
      it('should return "A" for cardinality 26', () => {
        expect(converter.fromCardinality(26)).toBe('A');
      });
      it('should return "Z" for cardinality 51', () => {
        expect(converter.fromCardinality(51)).toBe('Z');
      });
      it('should throw for cardinality 52 (out of range)', () => {
        expect(() => converter.fromCardinality(52)).toThrow();
      });
      it('should throw for negative cardinality', () => {
        expect(() => converter.fromCardinality(-1)).toThrow();
      });
      it('should throw for non-integer cardinality', () => {
        expect(() => converter.fromCardinality(0.99)).toThrow();
      });
    });
    describe('loop', () => {
      it('should return 39Y', () => {
        expect(
          converter.fromCoordinates(...converter.toCoordinates('39Y')),
        ).toBe('39Y');
      });
      it('should return [200, 11]', () => {
        expect(
          converter.toCoordinates(converter.fromCoordinates(200, 11)),
        ).toStrictEqual([200, 11]);
      });
    });
  });
});
