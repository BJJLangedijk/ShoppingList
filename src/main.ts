import Vue from 'vue';
import vuetify from './plugins/vuetify'
import firebase from 'firebase/app';
import 'firebase/firestore';
import store from './store';
import router from './router';
import './registerServiceWorker';
import App from './App.vue';


firebase.firestore().enablePersistence()
    .catch((err) => {
        console.log('Couldn\'t enable persistent storage', err);
    });

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App)
}).$mount('#app');
