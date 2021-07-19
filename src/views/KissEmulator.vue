<script>
import GamepadUtil from '../shared/GamepadUtil';
import Gimbal from '../components/Gimbal.vue';
import RCSwitch from '../components/RCSwitch.vue';
import SerialUsb from '../components/SerialUsb.vue';
import SwitchButton from '../components/SwitchButton.vue';

/**
 * View showing the components for emulating the Kiss protocol
 */
export default {
  components: {
    Gimbal,
    RCSwitch,
    SerialUsb,
    SwitchButton,
  },
  name: 'KissEmulator',
  data() {
    return {
      message: '',
      gamepadUtil: new GamepadUtil(this),
      gamepadsLength: 0,
      gamepadConnected: false,
      gamepadId: '',
      boundRCObserver: null,
    };
  },
  mounted() {
    const { gamepadId } = this.rcTransmitter;
    if (gamepadId) {
      this.gamepadConnected = true;
      this.gamepadId = gamepadId;
    }
    this.gamepadsLength = this.gamepadUtil.gamepadsLength;
    this.boundRCObserver = this.update.bind(this);
    this.rcTransmitter.addObserver(this.boundRCObserver);
  },
  beforeDestroy() {
    this.rcTransmitter.removeObserver(this.boundRCObserver);
  },
  computed: {
    /**
     * @returns {RCTransmitter} emulated transmitter
     */
    rcTransmitter() {
      return this.$store.getters['rcConfiguration/rcTransmitter'];
    },
    protocol() {
      return this.$store.getters['rcConfiguration/protocol'];
    },
  },
  methods: {
    /**
     * receiving notification of a change in the transmitter or configuration
     */
    update() {
      // TODO : Review to subscribe Protocol or ??? but not here
      this.protocol.axes.throttle = this.rcTransmitter.throttle.rcValue;
      this.protocol.axes.yaw = this.rcTransmitter.yaw.rcValue;
      this.protocol.axes.pitch = this.rcTransmitter.pitch.rcValue;
      this.protocol.axes.roll = this.rcTransmitter.roll.rcValue;
      this.protocol.axes.aux1 = this.rcTransmitter.auxiliary(0);
      this.protocol.axes.aux2 = this.rcTransmitter.auxiliary(1);
      this.protocol.axes.aux3 = this.rcTransmitter.auxiliary(2);
      this.protocol.axes.aux4 = this.rcTransmitter.auxiliary(3);
      this.protocol.axes.aux5 = this.rcTransmitter.auxiliary(4);
      this.protocol.axes.aux6 = this.rcTransmitter.auxiliary(5);
      this.protocol.axes.aux7 = this.rcTransmitter.auxiliary(6);
      this.protocol.axes.aux8 = this.rcTransmitter.auxiliary(7);
    },
    /**
     * gamepad new connection listener
     * @param {GamepadUtil} gamepadUtil
     * @param {gamepadconnected} event
     */
    gamepadConnectedEvent(gamepadUtil, event) {
      this.gamepadsLength = this.gamepadUtil.gamepadsLength;
      this.$store.dispatch('rcConfiguration/changeGamepad', event.gamepad.id);
      this.gamepadConnected = true;
      this.gamepadId = event.gamepad.id;
    },
    /**
     * gamepad disconnection listener
     */
    gamepadDisconnectedEvent() {
      this.gamepadsLength = this.gamepadUtil.gamepadsLength;
      this.gamepadConnected = false;
    },
    /**
     * Tells the protocol a new message to send
     */
    sendMessage() {
      this.protocol.message = this.message;
    },
  },
};
</script>

<template>
  <div>
    <SerialUsb :protocol="protocol"></SerialUsb>
    <div>
      <div class='aux' v-for="(aux, index) in this.rcTransmitter.auxiliaries" :key="aux.name">
        {{aux.name}}
        <RCSwitch size=40 :switch=index></RCSwitch>
      </div>
    </div>
    <input v-model="message" placeholder="update-me">
    <button @click="sendMessage()">Send message</button>
    <div>
      Armed :
      <SwitchButton :isEnabled="protocol.armed"/>
    </div>
    <div>
      <div class='all-switch'>
    <Gimbal size=150 axeHorizontal='yaw'
      axeVertical='throttle'></Gimbal>
    <Gimbal size=150 axeHorizontal='roll'
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
