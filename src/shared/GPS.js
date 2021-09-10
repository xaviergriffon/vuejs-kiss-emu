import LineSegment from './map/LineSegment';
import MapUtil from './map/MapUtil';
import AbstractObservable from './AbstractObservable';

export default class GPS extends AbstractObservable {
  #coordinates = [0, 0];

  #speed = 20;

  #altitude = 750;

  #numSatFix = 128 + 12;

  #groundCourse = 10;

  // lineString segments
  #segments = [];

  #startTime = null;

  #lastTime = null;

  #lineString = null;

  #lineStringLength = 0;

  #totDistTraveled = 0;

  get segments() {
    return this.#segments;
  }

  set segments(segments) {
    this.#segments = segments;
  }

  get lineString() {
    return this.#lineString;
  }

  set lineString(lineString) {
    this.#lineString = lineString;
  }

  /**
   * @returns {Array} coordinate ([latitude, longitude])
   */
  get coordinates() {
    this.computeDronePosition();
    return this.#coordinates;
  }

  /**
   * Set the current coordinates
   * @param {Array} coordinates current coordinates
   */
  set coordinates(coordinates) {
    this.#coordinates = coordinates;
  }

  /**
   * @returns {number} speed in Km/H
   */
  get speed() {
    return this.#speed;
  }

  /**
   * Set the speed
   * @param {number} speed speed in Km/h
   */
  set speed(speed) {
    const oldSpeed = this.#speed;
    this.#speed = speed;
    this.computeDronePosition();
    if (oldSpeed !== speed) {
      this.notify();
    }
  }

  /**
   * @returns {number} altitude in meter
   */
  get altitude() {
    return this.#altitude;
  }

  set altitude(altitude) {
    const toNotify = this.#altitude !== altitude;
    this.#altitude = altitude;
    if (toNotify) {
      this.notify();
    }
  }

  get numSatFix() {
    return this.#numSatFix;
  }

  set numSatFix(numSatFix) {
    const toNotify = this.#numSatFix !== numSatFix;
    this.#numSatFix = numSatFix;
    if (toNotify) {
      this.notify();
    }
  }

  get groundCourse() {
    return this.#groundCourse;
  }

  set groundCourse(groundCourse) {
    this.#groundCourse = groundCourse;
  }

  startNavigate() {
    // start in milliseconds
    this.#startTime = new Date().getTime();
    this.#lastTime = new Date().getTime();
    this.#lineStringLength = MapUtil.computeLineStringDistance(this.lineString);
    this.#totDistTraveled = 0;
  }

  get startTime() {
    return this.#startTime;
  }

  getLastSegment() {
    return this.segments.length != null
      ? this.segments[this.segments.length - 1] : new LineSegment([0, 0], [0, 0], 1, 0);
  }

  /**
   * Compute drone position
   */
  computeDronePosition() {
    if (this.speed === 0 || this.lineString == null) {
      return;
    }
    /**
     * Compute percent from last time
     */
    // get current segment in lineString
    const currentTime = new Date().getTime();
    const duration = currentTime - this.#lastTime;
    const dist = MapUtil.calcDist(this.speed, duration);
    if (dist < 0) {
      return;
    }

    this.#lastTime = currentTime;
    // console.log(`drone postition dist traveled ${dist} on ${this.#lineStringLength}`);
    // compute current travelled distance by percent
    // eslint-disable-next-line no-mixed-operators
    // const dist = this.#lineStringLength * percent;
    this.#totDistTraveled += dist;
    // last point is raised
    if (this.#totDistTraveled >= this.#lineStringLength) {
      // then stop move
      this.speed = 0;
      const lastSegment = this.getLastSegment();
      this.coordinates = [lastSegment.to[0], lastSegment.to[1]];
      console.debug(`animation end at ${new Date()}`);
      // return default position
      return;
    }
    this.coordinates = this.#lineString.getCoordinateAt(this.#totDistTraveled
      / this.#lineStringLength);
    this.notify();
  }
}
