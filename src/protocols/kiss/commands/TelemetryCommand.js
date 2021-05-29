/* eslint-disable no-bitwise */
import AbstractKissCommand from './AbstractKissCommand';

/**
 * Implementation of Telemetry KISS command (id : 0x20)
 *
 * Currently provides :
 * - Axes
 * - Armed
 * - Voltage
 * - Mode
 *
 */
export default class TelemetryCommand extends AbstractKissCommand {
  constructor() {
    super(0x20);
  }

  /**
   * Constructs the content of the query to provide the telemetry
   * @param {Kiss} protocol protocol containing the informations to be sent
   * @returns {ArrayBuffer} the content of the query to provide the telemetry
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  #telemetryBuffer(protocol) {
    const telemetrySize = 200;
    const buffer = new ArrayBuffer(telemetrySize);
    const telemetryBuffer = new DataView(buffer, 0);

    // Axes
    telemetryBuffer.setInt16(0, protocol.axes.throttle - 1000);
    telemetryBuffer.setInt16(2, protocol.axes.roll - 1500);
    telemetryBuffer.setInt16(4, protocol.axes.pitch - 1500);
    telemetryBuffer.setInt16(6, protocol.axes.yaw - 1500);
    // Armed
    telemetryBuffer.setInt8(16, protocol.armed ? 1 : 0);
    // Voltage
    telemetryBuffer.setInt16(17, Math.round(protocol.voltage * 100));
    // Mode
    telemetryBuffer.setInt8(65, protocol.mode);

    return telemetryBuffer;
  }

  buildBytesStream(protocol) {
    const telemetryBuffer = this.#telemetryBuffer(protocol);
    const buffer = new ArrayBuffer(telemetryBuffer.byteLength + 3);
    const bytesBuffer = new DataView(buffer);
    let i = 0;
    bytesBuffer.setInt8(i, this.KissFrameUnit);
    i += 1;
    // Telemetry
    bytesBuffer.setInt8(i, telemetryBuffer.byteLength);
    i += 1;
    for (let t = 0; t < telemetryBuffer.byteLength; t += 1) {
      bytesBuffer.setInt8(i, telemetryBuffer.getInt8(t));
      i += 1;
    }
    const checksum = AbstractKissCommand.checksum(telemetryBuffer);
    bytesBuffer.setInt8(i, checksum / telemetryBuffer.byteLength);
    i += 1;

    return bytesBuffer;
  }
}
