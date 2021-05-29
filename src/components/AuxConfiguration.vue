<script>
/**
 * Component to configure a auxilary channel.
 */
export default {
  name: 'AuxConfiguration',
  props: {
    auxNum: { Type: Number },
  },
  data() {
    return {
      auxValue: 0,
      valueChange: 0,
      isButton: false,
      boundRCObserver: null,
    };
  },
  computed: {
    /**
     * @returns {Auxiliary} auxilary to configure
     */
    aux() {
      return this.rcTransmitter.auxiliaries[this.auxNum];
    },
    /**
     * @returns {RCTransmitter} emulated transmitter
     */
    rcTransmitter() {
      return this.$store.getters['rcConfiguration/rcTransmitter'];
    },
  },
  mounted() {
    this.auxValue = this.aux.index;
    this.isButton = this.aux.isButton;
    this.boundRCObserver = this.update.bind(this);
    this.$store.dispatch('rcConfiguration/addObserver', this.boundRCObserver);
  },
  beforeDestroy() {
    this.$store.dispatch('rcConfiguration/removeObserver', this.boundRCObserver);
  },
  emits: ['change'],
  methods: {
    /**
     * receiving notification of a change in the transmitter or configuration
     */
    update() {
      this.valueChange += 1;
    },
    /**
     * @returns {number} number of elements for the type of auxilary (button or axe)
     */
    indexCount() {
      const indexCount = this.aux.isButton
        ? this.rcTransmitter.gamepadButtonCount
        : this.rcTransmitter.gamepadAxeCount;
      return indexCount;
    },
    /**
     * Notifies that the auxilary index has changed
     */
    auxChange() {
      this.aux.index = this.auxValue;
      this.$emit('change');
    },
    /**
     * Notifies the change of type
     */
    isButtonChange() {
      this.aux.isButton = this.isButton;
      this.$emit('change');
    },
  },
};
</script>
<template>
  <div>
    <div :key="valueChange">{{this.aux.name}}: {{this.aux.rcValue}}</div>
    <select @change="auxChange()" v-model="auxValue">
      <option v-for='index in indexCount() + 1'
        :key="index" :value="index - 2">{{index - 2 == -1 ? 'not defined' : index - 2}}</option>
    </select>
    <div>
      <input type="checkbox" name="isButton"
        @change="isButtonChange()"
        v-model="isButton">
      <label for="isButton">Button</label>
    </div>
  </div>
</template>
<style lang="scss" scoped>
</style>
