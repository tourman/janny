/**
 * https://stackoverflow.com/a/49402091/5479607
 */
export type KeysOfUnion<T> = T extends T ? keyof T : never;
