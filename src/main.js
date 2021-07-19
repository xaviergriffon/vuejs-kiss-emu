import Vue from 'vue';
import VueLayers from 'vuelayers';

import App from './App.vue';
import router from './router';
import store from './store';

import 'vuelayers/lib/style.css';

Vue.use(VueLayers);

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
  router,
  store,
}).$mount('#app');
