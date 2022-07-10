import { createApp } from 'vue'
import vuetify from './plugins/vuetify';
import firebase from 'firebase/app';
import 'firebase/firestore';
import store from './store';
import router from './router';
import './registerServiceWorker';
import App from './App.vue';
import longPress from './directives/long-press';
import { loadFonts } from './plugins/webfontloader'

loadFonts()

const firebaseConfig = {
};

firebase.initializeApp(firebaseConfig);

firebase.firestore().enablePersistence()
    .catch((err) => {
        console.log('Couldn\'t enable persistent storage', err);
    });

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(store)
app.directive('long-press', longPress)

app.mount('#app');
