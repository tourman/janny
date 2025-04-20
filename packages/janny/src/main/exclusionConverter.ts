import {
  type Dimension,
  type ExclusionDTOs,
  type ExclusionPanDTO,
  isPan,
  type Key,
  type Level,
  type Pan,
  type SpaceDTO,
} from './types';
import { get } from 'lodash-es';
import { extractExclusionPanDTODimensionFactory } from 'transport/ExclusionDTO/extractExclusionPanDTODimension';
import { isFactory } from 'transport/ExclusionDTO/isExclusionPanDTO';
import { PanToDimension } from 'transport/ExclusionDTO/PanToDimension/PanToDimension';
import { type ToExclusionsFactoryOptions } from 'transport/ExclusionDTO/toExclusions';
import { extractPanEntriesFactory } from 'transport/NestedSpaceDTO/extractPanEntries/extractPanEntries';
import { SpaceConverter } from 'transport/NestedSpaceDTO/SpaceConverter';
import { toPanMapFactory } from 'transport/NestedSpaceDTO/toPanMap';
import { intersect } from 'utils/intersect';
import { keyToPath } from 'utils/JSONPath/keyToPath';
import { pathToKey } from 'utils/JSONPath/pathToKey';
import { subtract } from 'utils/subtract';

interface ExclusionConverterFactoryOptions {
  spaceDTO: SpaceDTO;
  exclusionDTOs: ExclusionDTOs;
}

export function exclusionConverterFactory({
  spaceDTO,
  exclusionDTOs,
}: ExclusionConverterFactoryOptions) {
  const { isExclusionPanDTO } = isFactory(isPan);
  const extractExclusionPanEntries =
    extractPanEntriesFactory(isExclusionPanDTO);
  const toExclusionPanMap = toPanMapFactory<ExclusionPanDTO>(
    extractExclusionPanEntries,
  );
  const panToDimension = new PanToDimension<Pan, Dimension>(
    spaceDTO,
    exclusionDTOs,
    toExclusionPanMap,
    (pan) => pan(),
    (exclusionPan) =>
      'pick' in exclusionPan ? exclusionPan.pick : exclusionPan.omit,
    get,
  );
  const extractDimension = extractExclusionPanDTODimensionFactory<Pan, Level>({
    panToSpaceDimension:
      panToDimension.panToSpaceDimension.bind(panToDimension),
    panToExclusionDimension:
      panToDimension.panToExclusionDimension.bind(panToDimension),
    intersect,
    subtract,
  });
  const extractExclusionEntries = extractPanEntriesFactory(isExclusionPanDTO);
  const exclusionConverter = new SpaceConverter<ExclusionPanDTO, Key, Level>(
    isExclusionPanDTO,
    extractDimension,
    pathToKey,
    keyToPath,
    extractExclusionEntries,
  );
  return exclusionConverter satisfies ToExclusionsFactoryOptions<
    Pan,
    Key,
    Level
  >['converter'];
}
