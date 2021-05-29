import Vue from 'vue';
import VueRouter from 'vue-router';
import KissEmulator from '../views/KissEmulator.vue';
import GamepadConfiguration from '../views/GamepadConfiguration.vue';

Vue.use(VueRouter);

const routes = [
  /**
   * Simulator display
   */
  {
    path: '/',
    name: 'Emulator',
    component: KissEmulator,
  },
  /**
   * Radio control configuration
   */
  {
    path: '/configuration',
    name: 'Configuration',
    component: GamepadConfiguration,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
