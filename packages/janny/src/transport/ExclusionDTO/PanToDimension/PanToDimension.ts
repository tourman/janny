import invariant from 'invariant';
import { type ExclusionPanDTO } from 'transport/ExclusionDTO/ExclusionDTO';
import { type ExtractExclusionPanDTODimensionFactoryOptions } from 'transport/ExclusionDTO/extractExclusionPanDTODimension';
import { type NestedSpaceDTO } from 'transport/NestedSpaceDTO/NestedSpaceDTO';

export type Path = (string | number)[];

export type PanMap<Pan> = Map<Pan, Path>;

export interface ToPanMap<Pan> {
  (space: NestedSpaceDTO<Pan>): PanMap<Pan>;
}

export interface GetPan<Pan extends {}> {
  (space: NestedSpaceDTO<Pan>, path: Path): Pan | undefined;
}

export class PanToDimension<Pan extends {}, Dimension>
  implements
    Pick<
      ExtractExclusionPanDTODimensionFactoryOptions<Pan, Dimension>,
      'panToExclusionDimension' | 'panToSpaceDimension'
    >
{
  constructor(
    protected space: NestedSpaceDTO<Pan>,
    protected exclusions: Iterable<NestedSpaceDTO<Pan>>,
    protected toExclusionPanMap: ToPanMap<ExclusionPanDTO<Pan>>,
    protected extractDimension: (pan: Pan) => Dimension,
    protected extractPan: (exclusionPan: ExclusionPanDTO<Pan>) => Pan,
    protected getPan: GetPan<Pan>,
  ) {}
  protected mapOfPansFromExclusions: PanMap<Pan> | null = null;
  protected toMapOfPansFromExclusions() {
    const map = this.toExclusionPanMap([...this.exclusions]);
    return new Map(
      [...map.entries()].map(([exclusionPan, path]) => [
        this.extractPan(exclusionPan),
        path,
      ]),
    );
  }
  protected getMapOfPansFromExclusions() {
    return (
      this.mapOfPansFromExclusions ??
      (this.mapOfPansFromExclusions = this.toMapOfPansFromExclusions())
    );
  }
  panToExclusionDimension(pan: Pan): Dimension {
    return this.extractDimension(pan);
  }
  panToSpaceDimension(exclusionPan: Pan): Dimension {
    const exclusionPath = this.getMapOfPansFromExclusions().get(exclusionPan);
    invariant(typeof exclusionPath !== 'undefined', 'Invalid pan');
    const spacePath = exclusionPath.slice(1);
    const spacePan = this.getPan(this.space, spacePath);
    invariant(typeof spacePan !== 'undefined', 'Unable to find space pan');
    return this.extractDimension(spacePan);
  }
}
