/* eslint-disable no-plusplus */
/* eslint-disable no-dupe-class-members */
/**
 * Utility class to obtain information about gamepads.
 */
export default class GamepadUtil {
  /**
   * @returns {Array} all gamepads
   */
  // eslint-disable-next-line class-methods-use-this
  get gamepads() {
    return navigator.getGamepads();
  }

  /**
   * @returns {number} number of gamepads connected
   */
  get gamepadsLength() {
    const { gamepads } = this;
    let length = 0;
    if (gamepads !== undefined) {
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] !== null) {
          length += 1;
        }
      }
    }

    return length;
  }

  /**
   * @returns {boolean} true if gamepad supported by navigator
   */
  get gamepadSupported() {
    return this.gamepads !== undefined;
  }

  /**
   * Constructor
   * @param {object} listener listener invoked when connecting or disconnecting of a gamepad
   */
  constructor(listener) {
    this.listener = listener || null;
    this.#buidlWindowEvents();
  }

  /**
   * Built listeners to monitor gamepads
   * @private
   */
  #buidlWindowEvents() {
    window.addEventListener('gamepadconnected', this.#connectedEvent.bind(this));
    window.addEventListener('gamepaddisconnected', this.#disconnectedEvent.bind(this));
  }

  /**
   * Event invoked by the navigator when connecting a GamePad
   * @param {GamepadEvent} event event of gamepad
   * @private
   */
  #connectedEvent(event) {
    console.log('A gamepad connected:');
    console.log(event.gamepad);
    const { listener } = this;
    if (listener !== null && typeof listener.gamepadConnectedEvent === 'function') {
      listener.gamepadConnectedEvent(this, event);
    }
  }

  /**
   * Event invoked by the navigator when disconnecting a GamePad
   * @param {GamepadEvent} event event of gamepad
   * @private
   */
  #disconnectedEvent(event) {
    console.log('A gamepad disconnected:');
    console.log(event.gamepad);
    if (this.listener !== null && typeof this.listener.gamepadDisconnectedEvent === 'function') {
      this.listener.gamepadDisconnectedEvent(this, event);
    }
  }
}
