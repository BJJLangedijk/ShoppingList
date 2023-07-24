import { createRouter, createWebHistory } from 'vue-router';
const List = () => import('@/components/List.vue');
const Item = () => import('@/components/dialogs/Item.vue');
const Auth = () => import('@/components/Auth.vue');
import { getAuth } from 'firebase/auth';

const router = createRouter({
    history: createWebHistory(),
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

router.beforeEach((to, from, next) => {
  const currentUser = getAuth().currentUser;

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !currentUser) {
      next({name: 'Auth'});
  } else {
      next();
  }
});

export default router;
