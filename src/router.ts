import Vue from 'vue';
import Router from 'vue-router';
import List from '@/components/List.vue';
import Item from '@/components/dialogs/Item.vue';
import Auth from '@/components/Auth.vue';
import firebase from 'firebase/app';
import 'firebase/auth';

Vue.use(Router);

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/login',
            name: 'Auth',
            component: Auth,
        },
        {
            path: '/',
            name: 'List',
            component: List,
            children: [
                {path: '/add', component: Item, name: 'addItem'},
                {path: '/edit/section/:sectionId/item/:itemId', component: Item, name: 'editItem'}
            ],
            meta: {
                requiresAuth: true
            },
        },
    ],
});

// router.beforeEach((to, from, next) => {
//   const currentUser = firebase.auth().currentUser;
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

//   console.log(currentUser, requiresAuth)

//   if (requiresAuth && !currentUser) {
//       next({name: 'Auth'});
//   } else if (!requiresAuth && currentUser) {
//       next({name: 'Overview'});
//   } else {
//       next();
//   }
// });

export default router;
