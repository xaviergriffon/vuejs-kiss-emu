<script>
/**
 * Component for serial usb
 * @see https://web.dev/serial/
 */
import AbstractProtocol from '../protocols/AbstractProtocol';

export default {
  name: 'SerialUsb',
  required: true,
  props: {
    protocol: { Type: AbstractProtocol },
  },
  data() {
    return {
      devices: [],
      message: '',
      device: null,
      reader: null,
      // TODO : make it configurable
      baudRate: 115200,
      deviceOpened: false,
    };
  },
  mounted() {
    // Check if he Web Serial API is supported.
    if ('serial' in navigator) {
      const me = this;
      // Add listener to print connected devices
      navigator.serial.addEventListener('connect', () => {
        if (me.device === null) {
          me.printAllPorts();
        }
      });

      // Add listener to refresh connected devices and check disconnection of serial port used
      navigator.serial.addEventListener('disconnect', () => {
        me.printAllPorts();
        me.checkIfDeviceDisconnected();
      });

      me.printAllPorts();
    } else {
      this.message = 'Web Serial API not supported';
    }
  },
  beforeDestroy() {
    this.disconnect();
  },
  methods: {
    /**
     * @returns {string} name of device connected
     */
    connectedDeviceName() {
      if (this.device !== null) {
        const { usbProductId, usbVendorId } = this.device.getInfo();
        return `Product ${usbProductId} - Vendor ${usbVendorId}`;
      }
      return '';
    },
    /**
     * close reader and disconnect the serial usb
     */
    disconnect() {
      const me = this;
      if (me.reader) {
        me.reader.cancel().then(() => {
          me.$closeDevice();
        }).catch((error) => {
          console.error('error on disconnect promise');
          console.error(error);
        });
        me.reader = null;
      } else {
        me.$closeDevice();
      }
    },
    /**
     * disconnect the serial usb
     * @private
     */
    $closeDevice() {
      if (this.device) {
        const connectedDevice = this.device;
        this.device = null;
        connectedDevice.close().catch((error) => {
          console.error('error on close device');
          console.error(error);
        });
      }
    },
    /**
     * print connected devices
     */
    printAllPorts() {
      const me = this;
      navigator.serial.getPorts().then((ports) => {
        let d = 0;
        ports.forEach((port) => {
          const { usbProductId, usbVendorId } = port.getInfo();
          console.log(usbProductId);
          me.devices[d] = `Product id ${usbProductId} / Vendor id ${usbVendorId}`;
          d += 1;
        });
        me.$forceUpdate();
      });
    },
    /**
     * check whether the device is disconnected and if so update the information
     */
    checkIfDeviceDisconnected() {
      const me = this;
      if (me.device !== null) {
        const { myUsbProductId, myUsbVendorId } = me.device.getInfo();
        navigator.serial.getPorts().then((ports) => {
          let find = false;
          ports.forEach((port) => {
            const { usbProductId, usbVendorId } = port.getInfo();
            if (usbProductId === myUsbProductId && usbVendorId === myUsbVendorId) {
              find = true;
            }
          });
          if (!find) {
            me.device = null;
            me.$forceUpdate();
          } else {
            console.warn('device always connected');
          }
        });
      }
    },
    /**
     * asks the user to connect a device
     */
    askPort() {
      const me = this;
      navigator.serial.requestPort().then((port) => {
        if (port) {
          me.device = port;
          me.openPort();
        }
      });
    },
    /**
     * open the port on device
     */
    openPort() {
      const me = this;
      if (me.device !== null) {
        me.device.open({ baudRate: me.baudRate }).then(() => {
          me.deviceOpened = true;
          me.listenPort();
        });
      }
    },
    /**
     * write protocol stream to device
     */
    writeStream() {
      const me = this;
      if (me.device) {
        const bytesStream = me.protocol.getStreamToWrite();
        if (bytesStream) {
          const writer = me.device.writable.getWriter();
          writer.write(bytesStream).then(() => {
            writer.releaseLock();
            me.writeStream();
          });
        }
      }
    },
    /**
     * listen the device port
     */
    listenPort() {
      const me = this;
      if (me.device && me.device.readable) {
        me.reader = me.device.readable.getReader();
        me.read();
      }
    },
    /**
     * read stream from device
     */
    read() {
      const me = this;
      if (me.device !== null) {
        if (!me.reader) {
          me.listenPort();
          return;
        }
        try {
          me.reader.read().then((result) => {
            const { value, done } = result;
            if (done) {
              // Allow the serial port to be closed later.
              if (me.reader) {
                me.reader.releaseLock();
                me.reader = null;
              }
            }
            if (value) {
              me.protocol.readStream(value);
              me.writeStream();
              me.read();
            }
          }).catch((error) => {
            if (error.name === 'BufferOverrunError') {
              // reconnection
              me.listenPort();
            } else {
              console.error(error);
            }
          });
        } catch (error) {
          console.error(error);
          if (me.reader) {
            me.reader.releaseLock();
            me.reader = null;
          }
        }
      } else if (me.reader) {
        try {
          me.reader.releaseLock();
        } catch (error) {
          console.error(error);
        }
        me.reader = null;
      }
    },
  },
};
</script>

<template>
  <div>
    <div v-show="message !== ''">{{ message }}</div>
    <div v-for="device in devices" :key="device">
      {{ device }}
    </div>
    <button v-show="device === null" @click="askPort()">Connect device</button>
    <button v-show="device !== null" @click="disconnect()">Disconnect device</button>
    <div v-show="device !== null">Connected {{ connectedDeviceName() }}</div>
  </div>
</template>

<style scoped>

</style>
