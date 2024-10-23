import { createApp } from 'vue'
import vuetify from './plugins/vuetify';
import { initializeApp } from 'firebase/app';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import longPress from './directives/long-press';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDn9reyeI-8vKfHkPhlAlzwUD9boJh83F4',
    authDomain: 'shopping-list-11f0e.firebaseapp.com',
    databaseURL: 'https://shopping-list-11f0e.firebaseio.com',
    projectId: 'shopping-list-11f0e',
    storageBucket: 'shopping-list-11f0e.appspot.com',
    messagingSenderId: '1096143365939'
};

const firebaseApp = initializeApp(firebaseConfig);

initializeFirestore(firebaseApp, {localCache: persistentLocalCache()});

const pinia = createPinia();
const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(pinia)
app.directive('long-press', longPress)

app.mount('#app');
