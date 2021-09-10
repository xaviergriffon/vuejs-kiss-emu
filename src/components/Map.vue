<template>
  <div>
    <vl-map
      style="height: 400px"
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
      data-projection="EPSG:4326"
    >
      <vl-view
        :zoom.sync="zoom"
        :center.sync="center"
        :rotation.sync="rotation"
      ></vl-view>
      <vl-geoloc @update:position="positionUpdated($event)" v-if="geoloc">
        <template slot-scope="geoloc">
          <vl-feature v-if="geoloc.position" id="position-feature">
            <vl-geom-point :coordinates="geoloc.position"></vl-geom-point>
            <vl-style-box>
              <vl-style-icon
                src="marker.png"
                :scale="0.1"
                :anchor="[0.5, 1]"
              ></vl-style-icon>
            </vl-style-box>
          </vl-feature>
        </template>
      </vl-geoloc>
      <vl-feature id="featureDrone">
        <vl-geom-point
          v-if="showDrone"
          v-bind:coordinates="dronePosition"
        />
      </vl-feature>
      <vl-layer-vector :z-index="1">
        <vl-source-vector
          :features.sync="features"
          ident="the-source"
        ></vl-source-vector>

        <vl-style-box id="vlGreenBox">
          <vl-style-stroke color="green"></vl-style-stroke>
          <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
        </vl-style-box>
      </vl-layer-vector>
      <!-- :freehand="true" -->
      <vl-interaction-draw
        type="LineString"
        source="the-source"
        @drawstart="drawStart"
        @drawend="drawEnd"
        :freehand="true"
      >
        <vl-style-box>
          <vl-style-stroke color="blue"></vl-style-stroke>
          <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
        </vl-style-box>
      </vl-interaction-draw>

      <vl-layer-tile :z-index="0">
        <vl-source-osm></vl-source-osm>
      </vl-layer-tile>
    </vl-map>
    <div style="padding: 20px">
      Zoom: {{ zoom }}<br />
      Center: {{ center }}<br />
      Rotation: {{ rotation }}<br />
      My geolocation: {{ geolocPosition }}<br />
      Distance: {{ pathDistance }}
    </div>
    <div style="display: inline-flex;">
    <SpeedSwitch size=200 @update:speed="animate()" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LineString from 'ol/geom/LineString';
import MapUtil from '../shared/map/MapUtil';
import SpeedSwitch from './SpeedSwitch.vue';

export default {
  components: {
    SpeedSwitch,
  },
  data() {
    return {
      zoom: 2,
      center: [0, 0],
      rotation: 0,
      geoloc: true,
      geolocPosition: null,
      dronePosition: [0, 0],
      showDrone: false,
      features: [],
      mylineString: null,
      featureOfLineString: null,
      animationRequestCount: 0,
    };
  },
  created() {
    console.log('create Map');
  },
  mounted() {
    if (this.gps.lineString != null) {
      this.geoloc = false;
      this.showDrone = true;
      this.dronePosition = this.gps.coordinates;
      this.center = this.dronePosition;
      this.zoom = 14;
      this.mylineString = this.gps.lineString;
      console.log(this.mylineString);
      this.features.push({
        id: 'RECIPUO',
        type: 'Feature',
        geometry: {
          type: this.mylineString.getType(),
          coordinates: this.mylineString.getCoordinates(),
        },
      });
      window.requestAnimationFrame(this.animate.bind(this));
    }
  },
  computed: {
    // store mapping
    ...mapGetters({
      gps: 'rcConfiguration/gps',
    }),
    /**
     * @returns path is not null and path length > 0
     */
    pathDefine() {
      return this.features != null && this.features.length > 0;
    },
    /**
     * @returns path distance in km
     */
    pathDistance() {
      let distance = 0;
      if (this.pathDefine) {
        distance = MapUtil.computeLineStringDistance(this.lineString);
      }
      distance = Math.round((distance / 1000) * 100) / 100;
      return new Intl.NumberFormat().format(distance).concat(' km');
    },
    /**
     * LineString from feature.
     */
    lineString() {
      const [featureOfLineString] = this.features;
      if (this.mylineString == null || this.featureOfLineString !== featureOfLineString) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.featureOfLineString = featureOfLineString;
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.mylineString = new LineString(this.featureOfLineString.geometry.coordinates);
      }
      return this.mylineString;
    },
  },
  methods: {
    positionUpdated(event) {
      this.geolocPosition = event;
      this.center = this.geolocPosition;
      this.zoom = 14;
    },
    drawStart() {
      this.features = [];
      this.showDrone = false;
      console.debug('start drawing path');
    },
    drawEnd() {
      console.debug('end drawing path');
      // no features ! no path.
      if (!this.pathDefine) {
        return;
      }
      // start animation of drone now
      this.startAnimation();
      window.requestAnimationFrame(this.animate.bind(this));
    },
    /**
     * Start animation.
     * Reset all value
     */
    startAnimation() {
      this.showDrone = true;
      // animations
      this.gps.segments = MapUtil.extractLineStringSegment(this.lineString);
      // cooordonnées de départ
      this.gps.coordinates = this.gps.segments[0].from;
      this.gps.lineString = this.lineString;
      // start in milliseconds
      this.gps.startNavigate();

      console.debug('start at %o', new Date(this.gps.startTime));
    },
    /**
     * Animation
     * map on postCompose event of ol.map
     */
    animate() {
      if (this.animationRequestCount > 0) {
        this.animationRequestCount -= 1;
      }
      // no path no animation
      // eslint-disable-next-line no-underscore-dangle
      if (!this.pathDefine || this.gps.speed === 0 || this._isDestroyed) {
        return;
      }
      // animation start
      if (this.gps.speed >= 0) {
        if (this.animationRequestCount === 0) {
          this.dronePosition = this.gps.coordinates;
          window.requestAnimationFrame(this.animate.bind(this));
          this.animationRequestCount += 1;
        }
      }
    },
  },
};
</script>
