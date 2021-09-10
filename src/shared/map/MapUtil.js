import { getDistance } from 'ol/sphere';
// LineString's segment
import LineSegment from './LineSegment';
/**
 *
 * Map Util
 *
 * Compute distance betwwen 2 points (Vector 2D)
 * Extract LineSegment of a {ol.geom.LineString}
 * Compute length of a {ol.geom.LineString} (earth projection)
 */

class MapUtil {
  /**
     * Compute length (vector) for animation.
     * @param {ol/geom/LineString} lineString
     * @returns length (vector) for animation
     */
  static computeLineStringDistance(lineString) {
    const coordinates = lineString.getCoordinates();
    let values = 0;
    for (let index = 0; index < coordinates.length - 1; index += 1) {
      const distance = this.distance(coordinates[index], coordinates[index + 1]);
      values += distance;
    }
    return values;
  }

  /**
   * Return array of segments of lineString
   *
   * @param {ol.geom.LineString} linestring
   * @returns {Array} Array of {LineSegment}
   */
  static extractLineStringSegment(linestring) {
    // get point of the linestring
    const coordinates = linestring.getCoordinates();
    let index = 0;
    const values = [];
    for (index = 0; index < coordinates.length - 1; index += 1) {
      values.push(new LineSegment(coordinates[index], coordinates[index + 1],
        getDistance(coordinates[index], coordinates[index + 1]), index));
    }
    return values;
  }

  /**
   * Vector 2D distance.
   *
   * @param {Array} firstPoint
   * @param {Array} secondPoint
   * @returns distance between first point and second Point
   */
  static distance(firstPoint, secondPoint) {
    /*
    {
      projection: 'EPSG:4326',
      radius: DEFAULT_RADIUS,
    }
    */
    return getDistance(firstPoint, secondPoint);
  }

  static calcDist(speedKMh, durationMilliSec) {
    // eslint-disable-next-line no-mixed-operators
    const speedMMsec = speedKMh * 1000 / 3600000;
    return speedMMsec * durationMilliSec;
  }

  static calcPercentSpeed(speedKMh, durationMilliSec, distance) {
    const distanceTraveled = this.calcDist(speedKMh, durationMilliSec);
    return distanceTraveled / distance;
  }
}
export default MapUtil;
