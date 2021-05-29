import AbstractChannel from './AbstractChannel';
/**
 * Class representing an axe channel
 */
export default class Axe extends AbstractChannel {
  #reversed = false;

  constructor(name, index, reversed) {
    super();
    this.name = name;
    this.index = index;
    this.reversed = reversed;
  }

  /**
   * @returns {boolean} true if gamepad value is reversed
   */
  get reversed() {
    return this.#reversed;
  }

  /**
   * Set if gamepad value is reversed.
   * @param {boolean} reversed gamepad value is reversed ?
   */
  set reversed(reversed) {
    this.#reversed = reversed;
  }

  toRCValue(value) {
    return Math.round(value * (this.reversed ? -1 : 1) * 500 + 1500);
  }

  toGamepadValue(value) {
    return (value - 1500) / 500 / (this.reversed ? -1 : 1);
  }
}
