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

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  buildBytesStream(protocol) {
    return null;
  }
}
