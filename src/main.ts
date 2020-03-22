import Vue from 'vue';
import './store';
import vuetify from '@/plugins/vuetify';
const App = () => import('./App.vue');
import router from './router';
import store from './store';
import './registerServiceWorker';
import firebase from 'firebase/app';
import 'firebase/firestore';


firebase.firestore().enablePersistence()
  .catch(function(err) {
    console.log('Couldn\'t enable persistent storage', err);
  });

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App)
}).$mount('#app');
