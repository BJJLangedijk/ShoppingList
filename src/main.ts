import Vue from 'vue';
import './plugins/vuetify';
const App = () => import('./App.vue');
import router from './router';
import store from './store';
import './registerServiceWorker';
import firebase from 'firebase/app';
import 'firebase/firestore';

Vue.config.productionTip = false;

firebase.firestore().enablePersistence()
  .catch(function(err) {
    console.log('Couldn\'t enable persistent storage', err);
  });

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
