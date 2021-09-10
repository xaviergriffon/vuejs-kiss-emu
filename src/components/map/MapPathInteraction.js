/**
 * Map interactions.
 *
 * Draw drone path
 * Animation
 * Compute distance
 *
 */
import LineString from 'ol/geom/LineString';
import MapUtil from '../../shared/map/MapUtil';

class MapPathInteraction {
    // line features
    #features = [];

    // show/hide drone marker
    #showDrone = false;

    /**
     * Animations
     */
    // is drone animated ?
    #droneAnimation = false;

    /**
     * gps
     */
    #gps = null;

    /**
     * Listener called when position change
     */
    #dronePositionListener = null;

    #lineString = null;

    #featureOfLineString = null;

    constructor(gps, dronePositionListener) {
      this.#gps = gps;
      this.#dronePositionListener = dronePositionListener;
    }

    /**
     * End draw drone path
     */
    endDrawPath() {
      console.debug('end drawing path');
      // no features ! no path.
      if (!this.pathDefine) {
        return;
      }
      // start animation of drone now
      this.startAnimation();
    }

    /**
     * @returns path is not null and path length > 0
     */
    get pathDefine() {
      return this.#features.length > 0;
    }

    /**
     * @returns ol.map.feature
     */
    get features() {
      return this.#features;
    }

    /**
     * @param features ol.map.feature
     */
    set features(features) {
      this.#features = features;
      this.#lineString = null;
    }

    /**
     * Show drone
     */
    get showDrone() {
      return this.#showDrone;
    }

    /**
     * LineString from feature.
     */
    get lineString() {
      const [featureOfLineString] = this.#features;
      if (this.#lineString == null || this.#featureOfLineString !== featureOfLineString) {
        this.#featureOfLineString = featureOfLineString;
        this.#lineString = new LineString(this.#featureOfLineString.geometry.coordinates);
      }
      return this.#lineString;
    }

    /**
     * @returns path distance in km
     */
    get pathDistance() {
      let distance = 0;
      if (this.pathDefine) {
        distance = MapUtil.computeLineStringDistance(this.lineString);
      }
      distance = Math.round((distance / 1000) * 100) / 100;
      return new Intl.NumberFormat().format(distance).concat(' km');
    }

    /**
     * Animation
     * map on postCompose event of ol.map
     */
    animate() {
      // no path no animation
      if (!this.pathDefine || !this.#droneAnimation) {
        return;
      }
      // animation start
      if (this.#droneAnimation === true) {
        if (this.#dronePositionListener !== null) {
          this.#dronePositionListener();
        }
      }

      if (this.#gps.speed === 0) {
        this.#droneAnimation = false;
      }
    }

    /**
     * Start animation.
     * Reset all value
     */
    startAnimation() {
      this.#showDrone = true;
      this.#droneAnimation = true;
      // animations
      this.#gps.segments = MapUtil.extractLineStringSegment(this.lineString);
      // cooordonnées de départ
      this.#gps.coordinates = this.#gps.segments[0].from;
      this.#gps.lineString = this.lineString;
      // start in milliseconds
      this.#gps.startNavigate();

      console.debug('start at %o', new Date(this.#gps.startTime));
      if (this.#dronePositionListener !== null) {
        this.#dronePositionListener();
      }
    }

    /**
     * Stop animation
     */
    stopAnimation() {
      this.#droneAnimation = false;
      this.#showDrone = false;
      this.#gps.speed = 0;
      console.debug(`animation end at ${new Date()}`);
    }

    /**
     * Get drone position (render)
     * @returns {Array}
     */
    get dronePosition() {
      return this.#gps.coordinates;
    }
}

export default MapPathInteraction;
