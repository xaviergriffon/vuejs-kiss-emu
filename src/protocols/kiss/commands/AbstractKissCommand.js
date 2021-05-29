/* eslint-disable no-bitwise */
/* eslint-disable no-dupe-class-members */
/* eslint-disable no-undef */

/**
 * Abstract class containing the methods needed to emulate a KISS command
 */
export default class AbstractKissCommand {
  KissFrameUnit = 5;

  /**
   * Command id in byte
   */
  #byteCommand = 0;

  /**
   * Constructor
   * @param {number} byteCommand Command id in byte
   */
  constructor(byteCommand) {
    this.#byteCommand = byteCommand;
  }

  /**
   * @returns {number} the command id in byte
   */
  get byteCommand() {
    return this.#byteCommand;
  }

  /**
   * @returns {boolean} whether the checksum is needed in the request
   */
  // eslint-disable-next-line class-methods-use-this
  get needChecksum() {
    return false;
  }

  /**
   * @param {Kiss} protocol protocol containing the informations to be sent
   * @returns {Uint8Array} byte stream for request
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  buildBytesStream(protocol) {
    return new Uint8Array(0);
  }

  /**
   * Built a CRC8 key for the byte stream
   * @param {Uint8Array} byteStream byte stream to build the key
   * @returns {number} a CRC8 key
   * @static
   */
  static computeCRC8(byteStream) {
    let crc8 = 0;
    for (let b = 0; b < byteStream.byteLength; b += 1) {
      crc8 ^= byteStream.getInt8(b);
      for (let i = 0; i < 8; i += 1) {
        if ((crc8 & 0x80) !== 0) {
          crc8 = ((crc8 << 1) ^ 0xD5) & 0xFF;
        } else {
          crc8 <<= 1;
        }
      }
    }

    return crc8;
  }

  /**
   * Built a checksum for data view
   * @param {DataView} dataview dataview to validate
   * @returns {number} checksum for data view
   */
  static checksum(dataview) {
    let sum = 0;
    for (let t = 0; t < dataview.byteLength; t += 1) {
      sum += (dataview.getInt8(t) & 0xFF);
    }
    return sum;
  }

  /**
   * Formats a byte stream in hex
   * @param {Uint8Array} byteArray byte stream
   * @returns {string} representation of the byte stream in hex format
   */
  static toHexString(byteArray) {
    return Array.prototype.map.call(byteArray,
      (byte) => (`0${(byte & 0xFF).toString(16)}`).slice(-2)).join('');
  }

  /**
   * Formats a DataView in hex
   * @param {DataView} dataview DataView to format
   * @returns {string} representation of the DataView in hex format
   */
  static dataViewHexString(dataview) {
    let result = '';
    for (let t = 0; t < dataview.byteLength; t += 1) {
      result += ` 0${(dataview.getUint8(t) & 0xFF).toString(16)}`;
    }
    return result;
  }
}
