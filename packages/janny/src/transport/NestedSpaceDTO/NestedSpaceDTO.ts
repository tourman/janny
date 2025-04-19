export type InnerNestedSpace<P> =
  | number
  | string
  | null
  | P
  | InnerNestedSpace<P>[]
  | { [key: string]: InnerNestedSpace<P> };

/**
 * `P` stands for a pan that's a storage of a dimension
 */
export type NestedSpaceDTO<P> =
  | InnerNestedSpace<P>[]
  | Record<string, InnerNestedSpace<P>>;
