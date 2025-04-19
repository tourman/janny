import { isNestedSpaceDTO } from './isNestedSpaceDTO';

describe('isNestedSpaceDTO', () => {
  type Pan = { panId: string };

  const isPan = (value: unknown): value is Pan =>
    typeof value === 'object' &&
    value !== null &&
    'panId' in value &&
    typeof value.panId === 'string';

  test('fails when space is a function', () => {
    const input = () => {};
    expect(isNestedSpaceDTO(input, isPan)).toBe(false);
  });

  test.each([null, undefined, 123, 'abc', Symbol('sym')])(
    'fails when space is a primitive value: %p',
    (primitive) => {
      expect(isNestedSpaceDTO(primitive, isPan)).toBe(false);
    },
  );

  test.each([
    {
      description: 'array root with no pan',
      space: [1, 'a', null, [2, 3], { key: 'value' }],
    },
    {
      description: 'object root with no pan',
      space: {
        a: [1, 2],
        b: { inner: 'text' },
      },
    },
  ])('fails when %s (no pan found)', ({ space }) => {
    expect(isNestedSpaceDTO(space, isPan)).toBe(false);
  });

  test.each([
    {
      description: 'array root with one pan at root level',
      space: [{ panId: '123' }],
    },
    {
      description: 'object root with one pan at nested level',
      space: {
        foo: {
          bar: [{ panId: 'xyz' }],
        },
      },
    },
    {
      description: 'array root with deeply nested pan',
      space: [1, [2, [3, [{ panId: 'deep' }]]]],
    },
    {
      description: 'object root with deeply nested pan',
      space: {
        a: {
          b: {
            c: {
              d: [{ panId: 'deepest' }],
            },
          },
        },
      },
    },
  ])('passes when %s', ({ space }) => {
    expect(isNestedSpaceDTO(space, isPan)).toBe(true);
  });
});
