import Vue from 'vue';
import Vuex from 'vuex';
import RCConfigurationModule from './modules/RCConfiguration';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    // Contains the current configuration for the radio control
    rcConfiguration: RCConfigurationModule,
  },
});
