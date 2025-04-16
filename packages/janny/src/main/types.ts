import type * as Entities from 'entities';

export type Key = string;

export type Level = string | number;

export type Space = Entities.Space<Key, Level>;

export type LevelMap = Map<Key, Level>;

export type CaseInput = LevelMap;

export type CaseOutput = CaseInput;
