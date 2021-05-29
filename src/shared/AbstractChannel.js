/**
 * Abstract class representing a channel
 */
export default class AbstractChannel {
  #name = '';

  #index = -1;

  #value = 0;

  #rcValue = 0;

  /**
   * @returns {string} the name of channel
   */
  get name() {
    return this.#name;
  }

  /**
   * Set the name of channel.
   * @param {string} name of channel
   */
  set name(name) {
    this.#name = name;
  }

  /**
   * @returns {number} index of channel on RC
   */
  get index() {
    return this.#index;
  }

  /**
   * Set the index of channel on RC
   * @param {number} index index of channel on RC
   */
  set index(index) {
    this.#index = index;
  }

  /**
   * @returns {number} value gamepad
   */
  get value() {
    return this.#value;
  }

  /**
   * Set the value gamepad and translates to RC value
   * @param {number} value value gamepad
   */
  set value(value) {
    this.#value = value;
    this.#rcValue = this.toRCValue(value);
  }

  /**
   * @param {number} value value gamepad
   * @returns {number} translated value for RC
   */
  // eslint-disable-next-line class-methods-use-this
  toRCValue(value) {
    return value;
  }

  /**
   * @returns {number} RC value
   */
  get rcValue() {
    return this.#rcValue;
  }

  /**
   * Set the RC value and translate to value gamepad.
   * @param {number} value RC value
   */
  set rcValue(value) {
    this.#rcValue = value;
    this.#value = this.toGamepadValue(value);
  }

  /**
   * @param {number} value value RC
   * @returns {number} translated value for gamepad
   */
  // eslint-disable-next-line class-methods-use-this
  toGamepadValue(value) {
    return value;
  }
}
