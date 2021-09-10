import AbstractKissCommand from './AbstractKissCommand';

/**
 * Implementation of the GPS KISS command
 * (id : 0x54)
 *
 * TODO : write code...
 */
export default class GPSCommand extends AbstractKissCommand {
  constructor() {
    super(0x54);
  }

  /**
   * Built the request in bytes allowing to transmit the message.
   * @param {DataView} dataView DataView to transmit in the query
   * @returns {ArrayBuffer} the request to be transmitted
   */
  buildRequest(dataView) {
    const buffer = new ArrayBuffer(dataView.byteLength + 3);
    const bytesBuffer = new DataView(buffer, 0);

    let i = 0;
    // command
    bytesBuffer.setInt8(i, this.byteCommand);
    i += 1;
    // size
    bytesBuffer.setInt8(i, dataView.byteLength);
    i += 1;
    // content
    for (let t = 0; t < dataView.byteLength; t += 1) {
      bytesBuffer.setInt8(i, dataView.getInt8(t));
      i += 1;
    }
    // crc8
    bytesBuffer.setInt8(i, AbstractKissCommand.computeCRC8(dataView));
    i += 1;

    return bytesBuffer;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  buildBytesStream(protocol) {
    const { gps } = protocol;
    if (gps != null) {
      const buffer = new ArrayBuffer(4 + 4 + 2 + 2 + 2 + 1);
      const bytesBuffer = new DataView(buffer, 0);
      // console.log(`set lat ${gps.coordinates[0]} long ${gps.coordinates[1]} speed ${gps.speed}`);
      bytesBuffer.setInt32(0, gps.coordinates[0] * 10000000);
      bytesBuffer.setInt32(4, gps.coordinates[1] * 10000000);
      bytesBuffer.setInt16(8, gps.speed * 100);
      bytesBuffer.setInt16(10, gps.groundCourse * 10);
      bytesBuffer.setInt16(12, gps.altitude);
      /*
      *     GPS_fix           = kissread_u8(KISS_INDEX_GPS_NUMSATFIX) >> 7;
      GPS_numSat        = (kissread_u8(KISS_INDEX_GPS_NUMSATFIX)) & 0x7F;
      */
      bytesBuffer.setInt8(14, gps.numSatFix);

      return this.buildRequest(bytesBuffer);
    }

    return super.buildBytesStream(protocol);
  }
}
