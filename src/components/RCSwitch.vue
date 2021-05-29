<script>
/**
 * Component for a radio control switch
 */
export default {
  name: 'RCSwitch',
  required: true,
  props: {
    size: { Type: Number },
    switch: { Type: Number },
  },
  data() {
    return {
      value: 0,
      svg: null,
      metters: null,
      paint: false,
      coord: { x: 0, y: 0 },
      boundRCObserver: null,
    };
  },
  created() {
    this.boundRCObserver = this.update.bind(this);
    this.$store.dispatch('rcConfiguration/addObserver', this.boundRCObserver);
  },
  mounted() {
    this.svg = this.$refs.divSwitch;
    this.metters = this.$refs.meters;
    document.addEventListener('mousedown', this.startDrawing.bind(this));
    document.addEventListener('mouseup', this.stopDrawing.bind(this));
    document.addEventListener('mousemove', this.drawEvent.bind(this));
  },
  beforeDestroy() {
    this.$store.dispatch('rcConfiguration/removeObserver', this.boundRCObserver);
  },
  computed: {
    /**
     * @returns {RCTransmitter} emulated transmitter
     */
    rcTransmitter() {
      return this.$store.getters['rcConfiguration/rcTransmitter'];
    },
    /**
     * @returns {string} the d path for svg component
     */
    dPath() {
      return `M 0 ${this.size} L 0 0`;
    },
    /**
     * @returns {string} style for the meters
     */
    metersStyle() {
      return `stroke-dasharray: ${this.size}; stroke-dashoffset: ${this.size};`;
    },
    /**
     * @returns {number} width of stroke
     */
    strokeWidth() {
      return this.size / 3;
    },
  },
  methods: {
    /**
     * receiving notification of a change in the transmitter or configuration
     */
    update() {
      this.value = this.rcTransmitter.auxiliary(this.switch);
      const valuePercent = (this.value - 1000) / 10;
      this.draw(valuePercent);
    },
    /**
     * draw the contents of the switch
     * @param {any} value value to be represented in percentage
     */
    draw(value) {
      if (this.metters) {
        // Get the length of the path
        const length = this.metters.getTotalLength();

        // Calculate the percentage of the total length
        const to = length * ((100 - value) / 100);

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
        && this.coord.x < this.strokeWidth
        && this.coord.y >= 0
        && this.coord.y <= this.size);
    },
    /**
     * Start the drawing with mouse position
     * @param {mousedown} event
     */
    startDrawing(event) {
      this.getPosition(event);
      if (this.is_it_in_the_switch()) {
        this.paint = true;
        // eslint-disable-next-line no-mixed-operators
        const newValue = (this.size - this.coord.y) / this.size * 1000 + 1000;
        this.rcTransmitter.auxiliaries[this.switch].rcValue = newValue;
        this.rcTransmitter.notify();
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
        if (this.is_it_in_the_switch()) {
        // eslint-disable-next-line no-mixed-operators
          this.draw((this.size - this.coord.y) / this.size * 100);
        }

        this.getPosition(event);
      }
    },
  },
};
</script>

<template>
  <div class="progress-container" ref="divSwitch">
    <svg :width="strokeWidth" :height="size" >
      <path class="bg" stroke="#ECE5E5" :stroke-width="strokeWidth" :d="dPath"></path>
      <path ref="meters" class="meter" stroke="#F08080"
        :stroke-width="strokeWidth"
        :d="dPath"
        :style="metersStyle">
      </path>
    </svg>
  </div>
</template>

<style scoped>
.progress-container {
  display: grid;
  justify-content: center;
  align-items: center;
}
svg path {
  fill: none;
  stroke-miterlimit: round;
}
</style>
