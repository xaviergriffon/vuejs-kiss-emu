import AbstractProtocol from './AbstractProtocol';
import GPSCommand from './kiss/commands/GPSCommand';
import MessageCommand from './kiss/commands/MessageCommand';
import SettingsCommand from './kiss/commands/SettingsCommand';
import TelemetryCommand from './kiss/commands/TelemetryCommand';
/**
 * Implementation of the KISS protocol
 */
export default class Kiss extends AbstractProtocol {
  /**
   * Default version of FC firmware : 1.3RC44
   */
  static DEFAULT_VERSION = 122;

  #commands = {};

  #version = Kiss.DEFAULT_VERSION;

  /**
   * Default constructor to initialize the supported commands.
   */
  constructor() {
    super();
    this.initCommands();
  }

  /**
   * @returns {number} the version of FC firmawre
   */
  get version() {
    return this.#version;
  }

  /**
   * Set the version of FC firmware
   * @param {number} version version of FC firmware
   */
  set version(version) {
    this.#version = version;
  }

  /**
   * Initialization of supported commands.
   */
  initCommands() {
    const telemetry = new TelemetryCommand();
    this.#commands[telemetry.byteCommand] = telemetry;
    const message = new MessageCommand();
    this.#commands[message.byteCommand] = message;
    const settings = new SettingsCommand();
    this.#commands[settings.byteCommand] = settings;
    const gps = new GPSCommand();
    this.#commands[gps.byteCommand] = gps;
  }

  // TODO : see if movable in abstract
  readStream(bytesStream) {
    if (bytesStream && bytesStream.length > 0) {
      const command = this.#commands[bytesStream[0]];
      if (command) {
        const streamToWrite = command.buildBytesStream(this);
        if (streamToWrite) {
          this.addStreamToWrite(streamToWrite);
        }
      } else {
        console.log(`Command not found : ${bytesStream[0]}`);
      }
    }
  }
}
