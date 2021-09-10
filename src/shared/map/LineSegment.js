/**
 * LineString segment
 */
class LineSegment {
    /**
     * Start of segment
     * {Array}
     */
    #from = null;

    /**
     * End of segment
     * {Array}
     */
    #to = null;

    /**
     * Length of segment
     * {Number}
     */
    #length = null;

    /**
     * Angle in radian
     */
    #angle = null;

    /**
     * Index of segment in linestring
     */
    #index;

    /**
     * @param {Array} from
     * @param {Array} to
     * @param {Number} length
     */
    constructor(from, to, length, index) {
      this.#from = from;
      this.#to = to;
      this.#length = length;
      this.#angle = this.computeAngle();
      this.#index = index;
    }

    /**
     * Compute angle between 2 points.
     *
     * @returns {Float} angle in radian  between first point and second Point
     */
    computeAngle() {
      const xA = this.#from[0];
      const yA = this.#from[1];
      const xB = this.#to[0];
      const yB = this.#to[1];
      const divX = (xB - xA);
      const divY = (yB - yA);
      return Math.atan2(divY, divX);
    }

    /**
     * {Number} first point of the segment
     */
    get from() {
      return this.#from;
    }

    /**
     * {Number} last point of the segment
     */
    get to() {
      return this.#to;
    }

    /**
     * {Number} length of the segment
     */
    get size() {
      return this.#length;
    }

    /**
     * {Number} Angle
     */
    get angle() {
      return this.#angle;
    }

    /**
     * {Number} index of segment in LineString.
     */
    get index() {
      return this.#index;
    }

    log() {
      console.debug(`coords: ${this.#from}, ${this.#to} \n distance: ${this.size} \n angle: ${this.angle} `);
    }
}

export default LineSegment;
