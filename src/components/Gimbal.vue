<script>
/**
 * Component of a radio control gimbal
 */
export default {
  name: 'Gimbal',
  required: true,
  props: {
    size: { Type: Number },
    axeHorizontal: { Type: String },
    axeVertical: { Type: String },
  },
  data() {
    return {
      valueH: 0,
      valueV: 0,
      canvas: null,
      ctx: null,
      radius: this.size / 6.5,
      center: this.size / 2,
      gamepadsLength: 0,
      paint: false,
      coord: { x: 0, y: 0 },
      boundRCObserver: null,
    };
  },
  mounted() {
    this.boundRCObserver = this.update.bind(this);
    this.$store.dispatch('rcConfiguration/addObserver', this.boundRCObserver);
    this.canvas = this.$refs.gimbalCanvas;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    document.addEventListener('mousedown', this.startDrawing.bind(this));
    document.addEventListener('mouseup', this.stopDrawing.bind(this));
    document.addEventListener('mousemove', this.draw.bind(this));

    document.addEventListener('touchstart', this.startDrawing.bind(this));
    document.addEventListener('touchend', this.stopDrawing.bind(this));
    document.addEventListener('touchcancel', this.stopDrawing.bind(this));
    document.addEventListener('touchmove', this.draw.bind(this));
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
  },
  methods: {
    /**
     * receiving notification of a change in the transmitter or configuration
     */
    update() {
      const newValueH = this.rcTransmitter[this.axeHorizontal].rcValue;
      const newValueV = this.rcTransmitter[this.axeVertical].rcValue;
      if (newValueH !== this.valueH || newValueV !== this.valueV) {
        this.valueH = newValueH;
        this.valueV = newValueV;

        const unit = 1000 / 3;
        const diamUnit = this.radius / unit;
        const nWidth = this.center + ((this.valueH - 1500) * diamUnit);
        const nHeight = this.center - ((this.valueV - 1500) * diamUnit);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.background();
        this.joystick(nWidth, nHeight);
      }
    },
    /**
     * resize canvas and joystick
     */
    resize() {
      this.ctx.canvas.width = this.size;
      this.ctx.canvas.height = this.size;
      this.background();
      this.joystick(this.center, this.center);
    },
    /**
     * redraws the background of gimbal
     */
    background() {
      this.ctx.beginPath();
      this.ctx.arc(this.center, this.center, this.radius + this.size / 10, 0, Math.PI * 2, true);
      this.ctx.fillStyle = '#ECE5E5';
      this.ctx.fill();
    },
    /**
     * draw the joystick at the position
     * @param {number} width
     * @param {number} height
     */
    joystick(width, height) {
      this.ctx.beginPath();
      this.ctx.arc(width, height, this.radius, 0, Math.PI * 2, true);
      this.ctx.fillStyle = '#F08080';
      this.ctx.fill();
      this.ctx.strokeStyle = '#F6ABAB';
      this.ctx.lineWidth = 8;
      this.ctx.stroke();
    },
    /**
     * extract the position of mouse to coord
     * @param {mousedown} event
     */
    getPosition(event) {
      if (event) {
        const mouseX = event.clientX || event.touches[0].clientX;
        const mouseY = event.clientY || event.touches[0].clientY;
        this.coord.x = mouseX - this.canvas.offsetLeft;
        this.coord.y = mouseY - this.canvas.offsetTop;
      }
    },
    /**
     * indicates whether the coordinates are in the circle
     * @returns {boolean} true if pointer is in the circle
     */
    is_it_in_the_circle() {
      const x = this.coord.x - this.center;
      const y = this.coord.y - this.center;
      // eslint-disable-next-line no-restricted-properties
      const currentRadius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      return (this.radius >= currentRadius);
    },
    /**
     * Start the drawing with mouse position
     * @param {mousedown} event
     */
    startDrawing(event) {
      this.getPosition(event);
      if (this.is_it_in_the_circle()) {
        this.paint = true;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.background();
        this.joystick(this.coord.x, this.coord.y);
        this.draw();
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
    draw(event) {
      if (this.paint) {
        const angle = Math.atan2((this.coord.y - this.center), (this.coord.x - this.center));

        if (this.is_it_in_the_circle()) {
          // eslint-disable-next-line no-mixed-operators
          const newValueH = (this.coord.x - this.center) / this.radius * 500 + 1500;
          this.rcTransmitter[this.axeHorizontal].rcValue = newValueH;
          // eslint-disable-next-line no-mixed-operators
          const newValueV = (this.center - this.coord.y) / this.radius * 500 + 1500;
          this.rcTransmitter[this.axeVertical].rcValue = newValueV;
          this.rcTransmitter.notify();
        } else {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.background();
          const x = this.radius * Math.cos(angle) + this.center;
          const y = this.radius * Math.sin(angle) + this.center;
          this.joystick(x, y);
        }

        this.getPosition(event);
      }
    },
  },
};
</script>

<template>
  <div>
    <canvas ref='gimbalCanvas'></canvas>
  </div>
</template>

<style scoped>
</style>
