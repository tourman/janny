import invariant from 'invariant';

type Ranges = [[number, number], [number, number]];

export class TokenConverter {
  /**
   * ASCII codes for A-Z and a-z appropriately
   */
  ranges: Ranges = [
    [0x41, 0x5a],
    [0x61, 0x7a],
  ];
  protected getLengths(this: TokenConverter) {
    return this.ranges.map(([from, to]) => to - from + 1);
  }
  re = /^(\d+)([a-z])$/i;
  toCoordinates(this: TokenConverter, token: string): [number, number] {
    // validation
    const matchResult = token.match(this.re);
    invariant(matchResult, `Invalid token "${token}"`);
    const [, numberToken, letterToken] = [...matchResult] as (
      | string
      | undefined
    )[];
    invariant(typeof numberToken === 'string', `Invalid token "${token}"`);
    invariant(typeof letterToken === 'string', `Invalid token "${token}"`);
    return [this.toIndex(numberToken), this.toCardinality(letterToken)];
  }
  toIndex(numberToken: string): number {
    // validation
    invariant(
      /^\d+$/.test(numberToken),
      'Token number must be a positive integer starting from 1',
    );
    const number = parseInt(numberToken, 10);
    // validation
    invariant(
      number.toString(10) === numberToken,
      'Token number must be a positive integer starting from 1',
    );
    // validation
    invariant(
      number > 0,
      'Token number must be a positive integer starting from 1',
    );
    return number - 1;
  }
  toCardinality(this: TokenConverter, letterToken: string): number {
    // validation
    invariant(
      letterToken.length === 1,
      'Token letter must be exactly one character',
    );
    const { ranges } = this;
    const lengths = this.getLengths();
    const code = letterToken.charCodeAt(0);
    if (code >= ranges[0][0] && code <= ranges[0][1]) {
      return code - ranges[0][0] + lengths[1];
    } else if (code >= ranges[1][0] && code <= ranges[1][1]) {
      return code - ranges[1][0];
    } else {
      // validation
      throw new Error('Invalid character: must be a-z or A-Z');
    }
  }
  fromCoordinates(
    this: TokenConverter,
    index: number,
    cardinality: number,
  ): string {
    return [this.fromIndex(index), this.fromCardinality(cardinality)].join('');
  }
  fromIndex(index: number): string {
    // validation
    invariant(index === Math.floor(index), 'Index should be integer');
    // validation
    invariant(index >= 0, 'Index should be positive');
    return (index + 1).toString();
  }
  fromCardinality(this: TokenConverter, cardinality: number): string {
    // validation
    invariant(
      cardinality === Math.floor(cardinality),
      'Cardinality should be integer',
    );
    // validation
    invariant(cardinality >= 0, 'Cardinality should be positive');
    const { ranges } = this;
    const lengths = this.getLengths();
    // validation
    invariant(cardinality < lengths[0] + lengths[1], 'Cardinality is too high');
    return String.fromCharCode(
      cardinality < lengths[1]
        ? ranges[1][0] + cardinality
        : ranges[0][0] + cardinality - lengths[1],
    );
  }
}
