import AbstractChannel from './AbstractChannel';
/**
 * Class representing an auxiliary channel
 */
export default class Auxiliary extends AbstractChannel {
  #isButton = false;

  constructor(name) {
    super();
    if (name) {
      this.name = name;
    }
  }

  /**
   * @returns {boolean} true if the auxiliary is a button on the gamepad
   */
  get isButton() {
    return this.#isButton;
  }

  /**
   * Set if the auxiliary is a button on the gamepad
   * @param {boolean} isButton is a button on the gamepad ?
   */
  set isButton(isButton) {
    this.#isButton = isButton;
  }

  // eslint-disable-next-line class-methods-use-this
  toRCValue(value) {
    return Math.round(value * 1000 + 1000);
  }

  // eslint-disable-next-line class-methods-use-this
  toGamepadValue(value) {
    return (value - 1000) / 1000;
  }
}
