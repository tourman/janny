export type JSONType =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: JSONType }
  | JSONType[];
