import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchResults.vue'),
      meta: { requiresGoodreads: true },
    },
    {
      path: '/book/:id',
      name: 'book-details',
      component: () => import('../views/BookDetails.vue'),
      // Removed requiresGoodreads - let the component handle auth errors
    },
    {
      path: '/404',
      name: 'not-found',
      component: () => import('../views/NotFoundPage.vue'),
    },
    {
      path: '/auth/success',
      name: 'auth-success',
      component: () => import('../views/AuthSuccessView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

// Navigation guard to check authentication and Goodreads connection
router.beforeEach((to) => {
  if (to.meta.requiresGoodreads) {
    const authStore = useAuthStore()

    // Check if user is logged in and has Goodreads tokens
    if (!authStore.isLoggedIn || !authStore.hasGoodreadsTokens) {
      return { name: 'home' }
    }
  }
})

export default router
