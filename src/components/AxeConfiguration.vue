<script>
/**
 * Component to configure a axe channel.
 */
export default {
  name: 'AxeConfiguration',
  props: {
    axePropertyName: { Type: String },
  },
  data() {
    return {
      axeValue: 0,
      reversed: false,
      valueChange: 0,
      boundRCObserver: null,
    };
  },
  computed: {
    /**
     * @returns {Axe} axe to configure
     */
    axe() {
      return this.rcTransmitter[this.axePropertyName];
    },
    /**
     * @returns {RCTransmitter} emulated transmitter
     */
    rcTransmitter() {
      return this.$store.getters['rcConfiguration/rcTransmitter'];
    },
  },
  mounted() {
    this.axeValue = this.axe.index;
    this.reversed = this.axe.reversed;
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
     * Notifies that the axe index has changed
     */
    axeChange() {
      this.axe.index = this.axeValue;
      this.$emit('change');
    },
    /**
     *  Notifies the change of axe direction
     */
    reverseChange() {
      this.axe.reversed = this.reversed;
      this.$emit('change');
    },
  },
};
</script>

<template>
  <div>
    <div :key='valueChange'>{{this.axe.name}}: {{this.axe.rcValue}} </div>
    <div>axe: <select @change="axeChange()" v-model="axeValue">
      <option v-for='index in 5'
        :key="index" :value="index - 1">{{index -1}}</option>
    </select></div>
    <div>
      <input type="checkbox" name="reverseAxe"
        @change="reverseChange()"
        v-model="reversed">
      <label for="reverseAxe">Reverse</label>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
