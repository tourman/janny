import {
  type Path,
  type ToPanMap,
} from 'transport/ExclusionDTO/PanToDimension/PanToDimension';
import { type NestedSpaceDTO } from 'transport/NestedSpaceDTO/NestedSpaceDTO';

export interface ExtractEntries<Pan> {
  (nestedSpace: NestedSpaceDTO<Pan>): [Path, Pan][];
}

export function toPanMapFactory<Pan>(extractEntries: ExtractEntries<Pan>) {
  function toMapMap(nestedSpace: NestedSpaceDTO<Pan>): Map<Pan, Path> {
    return new Map(
      extractEntries(nestedSpace).map(([path, pan]) => [pan, path]),
    );
  }
  const convert = toMapMap satisfies ToPanMap<Pan>;
  return convert;
}
