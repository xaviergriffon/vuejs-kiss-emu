/* eslint-disable class-methods-use-this */
/**
 * Abstract class containing the minimum methods for a protocol.
 *
 * Implementations must overload the {@link readstream} method to intercept requests
 * and add their responses with {@link addStreamToWrite}.
 */
export default class AbstractProtocol {
  static AXE_DEFAULT_VALUE = 1000;

  #axes = {
    throttle: AbstractProtocol.AXE_DEFAULT_VALUE,
    yaw: AbstractProtocol.AXE_DEFAULT_VALUE,
    pitch: AbstractProtocol.AXE_DEFAULT_VALUE,
    roll: AbstractProtocol.AXE_DEFAULT_VALUE,
    axe1: AbstractProtocol.AXE_DEFAULT_VALUE,
    axe2: AbstractProtocol.AXE_DEFAULT_VALUE,
    axe3: AbstractProtocol.AXE_DEFAULT_VALUE,
    axe4: AbstractProtocol.AXE_DEFAULT_VALUE,
    axe5: AbstractProtocol.AXE_DEFAULT_VALUE,
    axe6: AbstractProtocol.AXE_DEFAULT_VALUE,
    axe7: AbstractProtocol.AXE_DEFAULT_VALUE,
    axe8: AbstractProtocol.AXE_DEFAULT_VALUE,
  };

  #armed = false;

  #voltage = 16;

  #mode = 0;

  #message = '';

  // #device = null;

  #streamsToWrite = [];

  /**
   * @returns {Map} a map of axes values
   */
  get axes() {
    return this.#axes;
  }

  /**
   * @returns {boolean} true if motors armed
   */
  get armed() {
    return this.#armed;
  }

  /**
   * Set if motors armed
   * @param {boolean} armed motors armed ?
   */
  set armed(armed) {
    this.#armed = armed;
  }

  /**
   * @returns {number} voltage of current
   */
  get voltage() {
    return this.#voltage;
  }

  /**
   * Set the voltage of current
   * @param {number} voltage voltage of current
   */
  set voltage(voltage) {
    this.#voltage = voltage;
  }

  /**
   * @returns {number} the flight mode
   */
  get mode() {
    return this.#mode;
  }

  /**
   * Set the flight mode
   * @param {number} mode flight mode
   */
  set mode(mode) {
    this.#mode = mode;
  }

  /**
   * @returns {string} message to display
   */
  get message() {
    return this.#message;
  }

  /**
   * Set a message to display
   * @param {string} message message to display
   */
  set message(message) {
    this.#message = message;
  }

  /**
  get device() {
    return this.#device;
  }

  set device(device) {
    this.#device = device;
  }
  */

  /**
   * When a request is received, this method is called to be interpreted by the protocol.
   * @param {Array} bytesStream stream to read
   */
  // eslint-disable-next-line no-unused-vars
  readStream(bytesStream) {}

  /**
   * Adds to the stream stack to be written to the device
   * @param {Uint8Array} bytesStream byte stream to write
   */
  addStreamToWrite(bytesStream) {
    this.#streamsToWrite.push(bytesStream);
  }

  /**
   * @returns stream to write. If null => nothing to write
   */
  getStreamToWrite() {
    let streamToWrite = null;
    if (this.#streamsToWrite.length > 0) {
      streamToWrite = this.#streamsToWrite.shift();
    }
    return streamToWrite;
  }
}
