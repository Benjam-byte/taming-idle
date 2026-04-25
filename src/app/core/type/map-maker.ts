import { Coordinate } from './coordinate';

export type MapMarkerType = 'custom' | 'resource' | 'danger' | 'target';

export type MapMarker = {
  id: string;
  coordinate: Coordinate;
  type: MapMarkerType;
};
