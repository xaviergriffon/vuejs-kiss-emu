<script>
export default {
  name: 'SpeedSwitch',
  required: true,
  props: {
    size: { Type: Number },
  },
  data() {
    return {
      StereoPannerNode: 0,
      speed: 0,
      svg: null,
      metters: null,
      paint: false,
      coord: { x: 0, y: 0 },
    };
  },
  mounted() {
    this.svg = this.$refs.divSwitch;
    this.metters = this.$refs.meters;
    this.speed = this.gps.speed;
    document.addEventListener('mousedown', this.startDrawing.bind(this));
    document.addEventListener('mouseup', this.stopDrawing.bind(this));
    document.addEventListener('mousemove', this.drawEvent.bind(this));
    const me = this;
    // Listener to intercept the gps when it stops and the speed goes to 0.
    this.gps.addObserver(() => {
      if (me.paint === false && me.gps.speed === 0) {
        me.draw(me.gps.speed);
      }
    });
  },
  computed: {
    /**
     * @returns {GPS} emulated GPS
     */
    gps() {
      return this.$store.getters['rcConfiguration/gps'];
    },
    /**
     * @returns {string} the d path for svg component
     */
    dPath() {
      return `M ${this.size} 0 L 0 0`;
    },
    /**
     * @returns {string} style for the meters
     */
    metersStyle() {
      const dashoffset = (this.gps.speed / 200) * this.size;
      return `stroke-dasharray: ${this.size}; stroke-dashoffset: ${dashoffset};`;
    },
    /**
     * @returns {number} height of stroke
     */
    strokeHeight() {
      return 30;
    },
  },
  methods: {
    /**
     * draw the contents of the switch
     * @param {any} value value to be represented in percentage
     */
    draw(value) {
      if (this.metters) {
        // Get the length of the path
        const length = this.metters.getTotalLength();

        // Calculate the percentage of the total length
        const to = length * (value / 100);

        // Trigger Layout in Safari hack https://jakearchibald.com/2013/animated-line-drawing-svg/
        this.metters.getBoundingClientRect();
        // Set the Offset
        // eslint-disable-next-line no-param-reassign
        this.metters.style.strokeDashoffset = Math.max(0, to);
      }
    },
    /**
     * extract the position of mouse to coord
     * @param {mousedown} event
     */
    getPosition(event) {
      if (event) {
        const mouseX = event.clientX || event.touches[0].clientX;
        const mouseY = event.clientY || event.touches[0].clientY;
        this.coord.x = mouseX - this.svg.offsetLeft;
        this.coord.y = mouseY - this.svg.offsetTop;
      }
    },
    /**
     * indicates whether the coordinates are in the switch
     * @returns {boolean} true if pointer is in the switch
     */
    is_it_in_the_switch() {
      return (this.coord.x >= 0
        && this.coord.x < this.size
        && this.coord.y >= 0
        && this.coord.y <= this.strokeHeight);
    },
    /**
     * Start the drawing with mouse position
     * @param {mousedown} event
     */
    startDrawing(event) {
      this.getPosition(event);
      if (this.is_it_in_the_switch()) {
        this.paint = true;
        this.drawEvent(event);
      }
    },
    /**
     * Stop the drawing
     */
    stopDrawing() {
      this.paint = false;
    },
    /**
     * Draw by following the movement of the mouse
     * @param {mousemove} event
     */
    drawEvent(event) {
      if (this.paint) {
        this.getPosition(event);
        if (this.is_it_in_the_switch()) {
        // eslint-disable-next-line no-mixed-operators
          this.draw((this.coord.x) / this.size * 100);

          // Vitesse calculé sur 200 max
          // eslint-disable-next-line no-mixed-operators
          this.speed = (this.coord.x) / this.size * 200;
          this.gps.speed = this.speed;
          this.$emit('update:speed', this.speed);
        }
      }
    },
  },
};
</script>

<template>
  <div class="progress-container" ref="divSwitch">
    <svg :height="strokeHeight" :width="size" >
      <path class="bg" stroke="#F08080" :stroke-height="strokeHeight"
        stroke-width="30" :d="dPath"></path>
      <path ref="meters" class="meter" stroke="#ECE5E5" stroke-width="30"
        :stroke-height="strokeHeight"
        :d="dPath"
        :style="metersStyle">
      </path>
    </svg>
    <div :key="speed">
      {{ speed }} km/h
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  display: grid;
  justify-content: center;
  align-items: center;
  user-select: none;
}
svg path {
  fill: none;
  stroke-miterlimit: round;
}
</style>
