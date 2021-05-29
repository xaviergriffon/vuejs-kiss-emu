/* eslint-disable no-bitwise */
import AbstractKissCommand from './AbstractKissCommand';
/**
 * Implementation of Settings KISS command (id : 0x30)
 *
 * Currently provides only a version
 *
 * TODO : to implement PIDs, filters, Rates and VTX
 */
export default class SettingsCommand extends AbstractKissCommand {
  constructor() {
    super(0x30);
  }

  /**
   * Constructs the content of the query to provide the configuration
   * @param {Kiss} protocol protocol containing the informations to be sent
   * @returns {ArrayBuffer} the content of the query to provide the configuration
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  #settingsBuffer(protocol) {
    const settingsSize = 167;
    const buffer = new ArrayBuffer(settingsSize);
    const settingsBuffer = new DataView(buffer, 0);

    // Version
    settingsBuffer.setUint8(92, protocol.version);

    return settingsBuffer;
  }

  buildBytesStream(protocol) {
    const settingsBuffer = this.#settingsBuffer(protocol);
    const buffer = new ArrayBuffer(settingsBuffer.byteLength + 3);
    const bytesBuffer = new DataView(buffer);
    let i = 0;
    bytesBuffer.setInt8(i, this.KissFrameUnit);
    i += 1;
    // settings
    bytesBuffer.setInt8(i, settingsBuffer.byteLength);
    i += 1;
    for (let t = 0; t < settingsBuffer.byteLength; t += 1) {
      bytesBuffer.setInt8(i, settingsBuffer.getInt8(t));
      i += 1;
    }
    const checksum = AbstractKissCommand.checksum(settingsBuffer);
    bytesBuffer.setInt8(i, checksum / settingsBuffer.byteLength);
    i += 1;
    return bytesBuffer;
  }
}
