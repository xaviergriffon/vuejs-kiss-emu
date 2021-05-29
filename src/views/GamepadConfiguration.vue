<script>
/**
 * View for configuring all transmitter channels from a gamepad
 */
import GamepadUtil from '../shared/GamepadUtil';
import Gimbal from '../components/Gimbal.vue';
import RCSwitch from '../components/RCSwitch.vue';
import AxeConfiguration from '../components/AxeConfiguration.vue';
import AuxConfiguration from '../components/AuxConfiguration.vue';

export default {
  components: {
    Gimbal,
    RCSwitch,
    AxeConfiguration,
    AuxConfiguration,
  },
  name: 'GamepadConfiguration',
  data() {
    return {
      gamepadUtil: new GamepadUtil(this),
      gamepadsLength: 0,
      gamepadConnected: false,
      gamepadId: '',
    };
  },
  mounted() {
    const { gamepadId } = this.rcTransmitter;
    if (gamepadId) {
      this.gamepadConnected = true;
      this.gamepadId = gamepadId;
    }
    this.gamepadsLength = this.gamepadUtil.gamepadsLength;
  },
  computed: {
    /**
     * @returns {RCTransmitter} simulated transmitter
     */
    rcTransmitter() {
      return this.$store.getters['rcConfiguration/rcTransmitter'];
    },
  },
  methods: {
    /**
     * gamepad new connection listener
     * @param {GamepadUtil} gamepadUtil
     * @param {gamepadconnected} event
     */
    gamepadConnectedEvent(gamepadUtil, event) {
      this.gamepadsLength = this.gamepadUtil.gamepadsLength;
      this.gamepadConnected = true;
      this.gamepadId = event.gamepad.id;
      this.$store.dispatch('rcConfiguration/changeGamepad', event.gamepad.id);
    },
    /**
     * gamepad disconnection listener
     */
    gamepadDisconnectedEvent() {
      this.gamepadsLength = this.gamepadUtil.gamepadsLength;
      this.gamepadConnected = false;
    },
  },
};
</script>

<template>
  <div>
    <div>gamepad supported: {{this.gamepadUtil.gamepadSupported}}</div>
    <div>number of gamepad connected: {{this.gamepadsLength}}</div>
    <div>
      <div class='aux'>
        <AxeConfiguration axePropertyName='throttle' />
        <AxeConfiguration axePropertyName='yaw' />
        <AxeConfiguration axePropertyName='pitch' />
        <AxeConfiguration axePropertyName='roll' />
      </div>
    </div>
    <div>
      <div class='aux' v-for="(aux, index) in this.rcTransmitter.auxiliaries" :key="aux.name">
        <AuxConfiguration :name='aux.name' :auxNum=index />
        <RCSwitch size=40 :switch=index></RCSwitch>
      </div>
    </div>
    <div>
      <div class='all-switch'>
    <Gimbal v-if="gamepadConnected" size=150 axeHorizontal='yaw'
      axeVertical='throttle'></Gimbal>
    <Gimbal v-if="gamepadConnected" size=150 axeHorizontal='roll'
      axeVertical='pitch'></Gimbal>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .aux {
    display: inline-flex;
  }
  .all-switch {
    display: inline-flex;
  }
</style>
