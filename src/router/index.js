import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import { getAuth } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const auth = getAuth(); // If auth is necessary, pull relevant info from firebase
    const user = auth.currentUser;

    if (!user) {
      next("/"); // redirect back to login
    } else {
      next(); // or proceed
    }
  } else {
    next(); // for the routes that do not require authentification
  }
})

export default router
