import { TokenConverter } from './TokenConverter';
import type * as Entities from 'entities';
import invariant from 'invariant';
import { type MatrixResultDTO } from 'transport/MatrixResultDTO/MatrixResultDTO';

export class TokenValidator<L extends {}> extends TokenConverter {
  constructor(protected space: Entities.Space<unknown, L>) {
    super();
  }
  protected static instanceMap = new WeakMap();
  static getInstance<L extends {}>(
    this: typeof TokenValidator<L>,
    space: Entities.Space<unknown, L>,
  ): TokenValidator<L> {
    if (!this.instanceMap.has(space)) {
      this.instanceMap.set(space, new this(space));
    }
    const instance = this.instanceMap.get(space);
    invariant(instance instanceof this, 'Unexpected empty instance');
    return instance;
  }
  assertMatrix(
    this: TokenValidator<L>,
    matrix: MatrixResultDTO,
  ): asserts matrix {
    matrix.forEach((line) => this.assertLine(line));
  }
  assertLine(this: TokenValidator<L>, line: string[]): asserts line {
    invariant(
      line.length === this.space.size,
      'Mismatch between space size and line input',
    );
    line.forEach((token, index) => this.assertToken(token, index));
  }
  assertToken(
    this: TokenValidator<L>,
    token: string,
    tokenIndex: number,
  ): asserts token {
    const [index, cardinality] = this.toCoordinates(token);
    invariant(index === tokenIndex, `Token "${token}" is out of place`);
    const dimension = this.getSpaceMatrix().at(index);
    invariant(typeof dimension !== 'undefined', 'Invalid index');
    const level = dimension.at(cardinality);
    invariant(
      typeof level !== 'undefined',
      `Token "${token}" has cardinality out of place`,
    );
  }
  protected spaceMatrix?: L[][];
  getSpaceMatrix(this: TokenValidator<L>): L[][] {
    let spaceMatrix = this.spaceMatrix;
    if (!spaceMatrix) {
      spaceMatrix = this.spaceMatrix = [...this.space.values()].map(
        (dimension) => [...dimension],
      );
    }
    return spaceMatrix;
  }
}
