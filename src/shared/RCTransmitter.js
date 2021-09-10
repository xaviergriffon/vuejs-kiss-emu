/* eslint-disable no-dupe-class-members */
import GamepadUtil from './GamepadUtil';
import Axe from './Axe';
import Auxiliary from './Auxiliary';
import AbstractObservable from './AbstractObservable';

/**
 * Class representing the data of a radio control from a gamepad
 */
export default class RCTransmitter extends AbstractObservable {
  #gamepadId = null;

  #gamepadUtil = null;

  #throttle = new Axe('Throttle', 0, true);

  #yaw = new Axe('Yaw', 3, false);

  #pitch = new Axe('Pitch', 2, true);

  #roll = new Axe('Roll', 1, false);

  #auxiliaries = [];

  /**
   * Constructor
   * @param {string} gamepadId id of gamepad
   */
  constructor(gamepadId) {
    super();
    this.#gamepadId = gamepadId;
    this.#gamepadUtil = new GamepadUtil(this);
    this.auxiliariesCount = 8;
    if (this.#gamepadId !== null) {
      // The data is refreshed by the browser before next repaint
      window.requestAnimationFrame(this.#refreshValues.bind(this));
    }
  }

  /**
   * @returns {Gamepad} gamepad data source
   */
  get gamepad() {
    return this.#findGamepad();
  }

  /**
   * @returns {string} id of gamepad data source
   */
  get gamepadId() {
    return this.#gamepadId;
  }

  /**
   * Set the id of gamepad data source
   * @param {string} id id of gamepad data source
   */
  set gamepadId(id) {
    console.log(`gamepadId change ${id}`);
    this.#gamepadUtil = id;
  }

  /**
   * @returns {number} throttle value
   */
  get throttle() {
    return this.#throttle;
  }

  /**
   * @returns {number} yaw value
   */
  get yaw() {
    return this.#yaw;
  }

  /**
   * @returns {number} pitch value
   */
  get pitch() {
    return this.#pitch;
  }

  /**
   * @returns {number} roll value
   */
  get roll() {
    return this.#roll;
  }

  /**
   * @returns {Array} auxiliaries
   */
  get auxiliaries() {
    return this.#auxiliaries;
  }

  /**
   * @returns {number} number of auxiliaries
   */
  get auxiliariesCount() {
    return this.auxiliaries.count;
  }

  /**
   * Set the number of auxiliaries.
   *
   * This method automatically instantiates the auxiliaries
   * @param {number} count number of auxiliaries
   */
  set auxiliariesCount(count) {
    const auxiliariesCount = count >= 0 ? count : 0;
    while (this.auxiliaries.length > auxiliariesCount) {
      this.auxiliaries.pop();
    }
    while (this.auxiliaries.length < auxiliariesCount) {
      this.auxiliaries.push(new Auxiliary(`Aux ${this.auxiliaries.length + 1}`));
    }
  }

  /**
   * @returns {number} number of buttons on the gamepad
   */
  get gamepadButtonCount() {
    return this.gamepad ? this.gamepad.buttons.length : 0;
  }

  /**
   * @returns {number} number of axes on the gamepad
   */
  get gamepadAxeCount() {
    return this.gamepad ? this.gamepad.axes.length : 0;
  }

  /**
   * @param {number} value value to be rounded
   * @param {number} places number of decimals
   * @returns {number} value rounded
   * @private
   */
  static #round(value, places) {
    const n = 10 ** places;
    return Math.round(value * n) / n;
  }

  /**
   * Refreshing values from the gamepad
   * @private
   */
  #refreshValues() {
    if (this.gamepad !== null) {
      const { gamepad } = this;
      this.throttle.value = RCTransmitter.#round(gamepad.axes[this.throttle.index], 5);
      this.yaw.value = RCTransmitter.#round(gamepad.axes[this.yaw.index], 5);
      this.pitch.value = RCTransmitter.#round(gamepad.axes[this.pitch.index], 5);
      this.roll.value = RCTransmitter.#round(gamepad.axes[this.roll.index], 5);
      /* eslint no-param-reassign: ["error", { "props": false }] */
      this.auxiliaries.forEach((aux) => {
        let value = 0;
        const { index } = aux;
        if (index >= 0) {
          if (aux.isButton) {
            if (index < gamepad.buttons.length) {
              value = gamepad.buttons[index].value;
            }
          } else if (index < gamepad.axes.length) {
            value = gamepad.axes[index];
          }
        }
        aux.value = value;
      });
    } else {
      this.#resetValues();
    }

    this.notify();
    // The data is refreshed by the browser before next repaint
    window.requestAnimationFrame(this.#refreshValues.bind(this));
  }

  /**
   * Reset all values
   * @private
   */
  #resetValues() {
    this.throttle.value = 0;
    this.yaw.value = 0;
    this.pitch.value = 0;
    this.roll.value = 0;
    this.auxiliaries.forEach((aux) => { aux.value = 0; });
  }

  /**
   * Find the gamepad from it's id
   * @returns {Gamepad} gamepad data source
   */
  #findGamepad() {
    for (let i = 0; i < this.#gamepadUtil.gamepads.length; i += 1) {
      const gamepad = this.#gamepadUtil.gamepads[i];
      if (gamepad && gamepad.id === this.#gamepadId) {
        return gamepad;
      }
    }

    return null;
  }

  /**
   * @param {number} num number of auxiliary
   * @returns {number} value of auxiliary corresponding to the number
   */
  auxiliary(num) {
    if (num < this.auxiliaries.length) {
      return this.auxiliaries[num].rcValue;
    }

    return 0;
  }
}
