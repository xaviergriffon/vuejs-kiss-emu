<template>
<div>
  <vl-map style="height: 400px" :load-tiles-while-animating="true"
    :load-tiles-while-interacting="true"
    data-projection="EPSG:4326">
    <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>
    <vl-geoloc @update:position="positionUpdated($event)">
      <template slot-scope="geoloc">
        <vl-feature v-if="geoloc.position" id="position-feature">
          <vl-geom-point :coordinates="geoloc.position"></vl-geom-point>
          <vl-style-box>
            <vl-style-icon src="marker.png" :scale="0.1" :anchor="[0.5, 1]"></vl-style-icon>
          </vl-style-box>
        </vl-feature>
      </template>
    </vl-geoloc>
    <vl-feature>
      <vl-geom-point :coordinates="geolocCenter"></vl-geom-point>
    </vl-feature>
    <vl-layer-vector :z-index="1">
      <vl-source-vector :features.sync="features" ident="the-source"></vl-source-vector>

      <vl-style-box id="vlGreenBox">
        <vl-style-stroke color="green"></vl-style-stroke>
        <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
      </vl-style-box>
    </vl-layer-vector>

    <vl-interaction-draw type="LineString" source="the-source" @drawstart="drawStart()"
      @drawend="drawEnd()">
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
    Zoom: {{ zoom }}<br>
    Center: {{ center }}<br>
    Rotation: {{ rotation }}<br>
    My geolocation: {{ geolocPosition }}<br>
    Distance: {{ distance }}
  </div>
</div>
</template>

<script>
import 'vuelayers/lib/style.css';

export default {
  data() {
    return {
      zoom: 2,
      center: [0, 0],
      features: [],
      rotation: 0,
      geolocPosition: undefined,
      geolocCenter: [0, 0],
      interv: null,
      nInterv: 0,
    };
  },
  computed: {
    /**
     * @returns {AbstractProtocol} emulated protocol
     */
    protocol() {
      return this.$store.getters['rcConfiguration/protocol'];
    },
    distance() {
      let distance = 0;
      if (this.features.length > 0) {
        const start = this.features[0].geometry.coordinates[0];
        const end = this.features[0].geometry.coordinates[1];
        // convertion des valeures du degree vers le radian
        const latRad = start[0] * 0.017453293;
        const lonRad = start[1] * 0.017453293;
        const tlatRad = end[0] * 0.017453293;
        const tlonRad = end[1] * 0.017453293;
        /*
        let midLat = tlatRad - latRad;
        let midLon = tlonRad - lonRad;
        */

        // Calcule de la distance en Km
        const latSin = Math.sin((latRad - tlatRad) / 2);
        const lonSin = Math.sin((lonRad - tlonRad) / 2);

        distance = 2 * Math.asin(Math.sqrt((latSin * latSin)
          + Math.cos(latRad) * Math.cos(tlatRad) * (lonSin * lonSin)));
        // pour la distance en Km il faut multiplier la valeure trouvée par le rayon de la terre
        distance *= 6371;
      }
      return distance;
    },
  },
  methods: {
    positionUpdated(event) {
      this.geolocPosition = event;
      this.center = this.geolocPosition;
      this.zoom = 14;
    },
    deg2rad(x) {
      // eslint-disable-next-line no-mixed-operators
      return Math.PI * x / 180;
    },
    get_distance_m(lng1, lat1, lng2, lat2) {
      // Terre = sphère de 6378km de rayon
      const earthRadius = 6378137;
      // CONVERSION
      const rlo1 = this.deg2rad(lng1);
      const rla1 = this.deg2rad(lat1);
      const rlo2 = this.deg2rad(lng2);
      const rla2 = this.deg2rad(lat2);
      const dlo = (rlo2 - rlo1) / 2;
      const dla = (rla2 - rla1) / 2;
      const a = (Math.sin(dla) * Math.sin(dla))
        + Math.cos(rla1) * Math.cos(rla2) * (Math.sin(dlo) * Math.sin(dlo));
      const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return (earthRadius * d);
    },
    calcPosition(pointA, pointB, percent) {
      const longSens = pointA[0] <= pointB[0] ? 1 : -1;
      const long = pointA[0] + ((Math.abs((pointA[0] - pointB[0])) * percent) * longSens);
      const latSens = pointA[1] <= pointB[1] ? 1 : -1;
      const lat = pointA[1] + ((Math.abs((pointA[1] - pointB[1])) * percent) * latSens);
      return [long, lat];
    },
    drawStart() {
      this.features = [];
      clearInterval(this.interv);
      console.log('draw start');
    },
    drawEnd() {
      this.nInterv += 1;
      const currInterv = this.nInterv;
      console.log(this.features);
      const me = this;
      const percentSpeed = 0.01;
      let f = 0;
      let c = 1;
      let percent = 0;
      me.interv = setInterval(() => {
        if (me.features.length <= 0) {
          return;
        }
        const { geometry } = me.features[f];
        const fPoint = geometry.coordinates[c - 1];
        const sPoint = geometry.coordinates[c];
        me.geolocCenter = me.calcPosition(fPoint, sPoint, percent);
        console.log(me.protocol);
        me.protocol.coordinates = me.geolocCenter;
        console.log(`${currInterv} Curr dist : ${me.get_distance_m(fPoint[0], fPoint[1], me.geolocCenter[0], me.geolocCenter[1])}`);
        percent += percentSpeed;
        if (percent >= 1) {
          c += 1;
          percent = percentSpeed;
        }
        if (c >= geometry.coordinates.length) {
          f += 1;
          c = 1;
          percent = 0;
        }
        if (f >= this.features.length) {
          clearInterval(me.interv);
        }
      }, 1000);
    },
  },
};
</script>
