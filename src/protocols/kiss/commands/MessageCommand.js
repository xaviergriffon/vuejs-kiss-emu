import AbstractKissCommand from './AbstractKissCommand';

/**
 * Implementation of Message KISS command (id : 0x73)
 */
export default class MessageCommand extends AbstractKissCommand {
  #duration = 3000; // 3s

  #priority = 0;

  constructor() {
    super(0x73);
  }

  /**
   * @returns {number} message display time
   */
  get duration() {
    return this.#duration;
  }

  /**
   * Set the duration of the message
   * @param {number} duration display time
   */
  set duration(duration) {
    this.#duration = duration >= 0 ? duration : 0;
  }

  /**
   * @returns {number} priority level of message
   */
  get priority() {
    return this.#priority;
  }

  /**
   * Set the priority level of the message.
   * @param {number} priority priority level of the message
   */
  set priority(priority) {
    this.#priority = priority >= 0 ? priority : 0;
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

  /**
   * Encode the message to array of Uint8
   * @param {*} message message to encode
   * @returns {Uint8Array} message encoded in UTF-8
   * @private
   */
  static #messageToBytesArray(message) {
    const utf8Encode = new TextEncoder();
    return utf8Encode.encode(message);
  }

  buildBytesStream(protocol) {
    const { message } = protocol;
    if (message && message.length > 0) {
      const messageBytesArray = MessageCommand.#messageToBytesArray(message);
      // Reset the message because sent
      // eslint-disable-next-line no-param-reassign
      protocol.message = '';
      const buffer = new ArrayBuffer(2 + 1 + messageBytesArray.byteLength + 1);
      const bytesBuffer = new DataView(buffer, 0);
      bytesBuffer.setInt16(0, this.duration);
      bytesBuffer.setInt8(2, this.priority);
      let i = 3;
      messageBytesArray.forEach((byte) => {
        bytesBuffer.setInt8(i, byte);
        i += 1;
      });
      // End of string in C-language
      bytesBuffer.setInt8(i, 0);
      const request = this.buildRequest(bytesBuffer);
      // TODO : Trace in Debug level logs
      // const hexMessage = AbstractKissCommand.dataViewHexString(request);
      // console.log(`Messsage to hex : ${hexMessage}`);
      return request;
    }

    return null;
  }
}
