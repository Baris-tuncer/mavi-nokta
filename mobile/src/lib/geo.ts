type Coords = { latitude: number; longitude: number };

const RAD = Math.PI / 180;
const R = 6_371_000; // Earth radius in meters

export function haversineDistance(a: Coords, b: Coords): number {
  const dLat = (b.latitude - a.latitude) * RAD;
  const dLng = (b.longitude - a.longitude) * RAD;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(a.latitude * RAD) * Math.cos(b.latitude * RAD) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function bearing(from: Coords, to: Coords): number {
  const fLat = from.latitude * RAD;
  const tLat = to.latitude * RAD;
  const dLng = (to.longitude - from.longitude) * RAD;
  const y = Math.sin(dLng) * Math.cos(tLat);
  const x =
    Math.cos(fLat) * Math.sin(tLat) -
    Math.sin(fLat) * Math.cos(tLat) * Math.cos(dLng);
  return Math.atan2(y, x); // radians, 0 = North, clockwise
}
