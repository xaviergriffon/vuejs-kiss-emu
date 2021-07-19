import RCTransmitter from '../../shared/RCTransmitter';
import Kiss from '../../protocols/Kiss';

/**
 * Storage module of the radio control configuration.
 */
export default {
  namespaced: true,
  state: {
    rcTransmiter: null,
    gamepadId: null,
    protocol: new Kiss(),
    observers: [],
  },
  mutations: {
    /**
     * Mutation of the Gamepad ID.
     * @param {state} state state
     * @param {string} gamepadId id of gamepad
     */
    changeGamepad(state, gamepadId) {
      state.gamepadId = gamepadId;
    },
  },
  getters: {
    /**
     * @param {state} state state
     * @returns {RCTransmitter} the rcTransmitter of state
     */
    rcTransmitter(state) {
      let { rcTransmiter } = state;
      const { gamepadId, observers } = state;
      if (rcTransmiter && rcTransmiter.gamepadId !== gamepadId) {
        rcTransmiter.removeAllObservers();
        rcTransmiter = null;
      }
      if (!rcTransmiter) {
        rcTransmiter = new RCTransmitter(gamepadId);
        state.rcTransmiter = rcTransmiter;
        // transfer of observers
        observers.forEach((element) => rcTransmiter.addObserver(element));
      }

      return rcTransmiter;
    },
    protocol(state) {
      const { protocol } = state;
      return protocol;
    },
  },
  actions: {
    /**
     * Indicates the change of gamepad.
     * @param {context} context context
     * @param {string} gamepadId id of gamepad
     */
    changeGamepad({ commit }, gamepadId) {
      commit('changeGamepad', gamepadId);
    },
    /**
     * Add an observer of  changes to the RCTransmitter.
     * @param {context} context context
     * @param {Object} observer observer of  changes to the RCTransmitter
     */
    addObserver({ state }, observer) {
      if (!state.observers.includes(observer)) {
        state.observers.push(observer);
        if (state.rcTransmiter) {
          state.rcTransmiter.addObserver(observer);
        }
      }
    },
    /**
     * Remove an observer of  changes to the RCTransmitter.
     * @param {context} context context
     * @param {Object} observer observer of  changes to the RCTransmitte
     */
    removeObserver({ state }, observer) {
      if (state.observers.includes(observer)) {
        state.observers.splice(observer);
        if (state.rcTransmiter) {
          state.rcTransmiter.removeObserver(observer);
        }
      }
    },
  },
};
