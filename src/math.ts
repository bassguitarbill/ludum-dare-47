
export function computeScreenCoords<T extends Partial<ScreenPoint>>(out: T, {x, y}: Point, {tilewidth, tileheight}: TileDimensions) {
  out.screenX = ((x - y) * tilewidth/2);
  out.screenY = ((x + y) * tileheight/2);
  return out as T&ScreenPoint;
}

export interface Point {
  x: number;
  y: number;
}

export interface ScreenPoint {
  screenX: number;
  screenY: number;
}

type TileDimensions = {tilewidth: number, tileheight: number}

export type GeoLookup<T> = {
  [x: number]: {
    [y: number]: T|undefined
  }|undefined
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
