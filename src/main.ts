import { createApp } from 'vue'
import vuetify from './plugins/vuetify';
import { initializeApp } from 'firebase/app';
import store from './store';
import router from './router';
import App from './App.vue';
import longPress from './directives/long-press';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig = {
};

const firebaseApp = initializeApp(firebaseConfig);

initializeFirestore(firebaseApp, {localCache: persistentLocalCache()});

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(store)
app.directive('long-press', longPress)

app.mount('#app');
