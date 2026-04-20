import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/add',
    name: 'Add',
    component: () => import('../views/AddEditView.vue')
  },
  {
    path: '/edit/:id',
    name: 'Edit',
    component: () => import('../views/AddEditView.vue')
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('../views/DetailView.vue')
  },
  {
    path: '/actor/:name',
    name: 'Actor',
    component: () => import('../views/ActorView.vue')
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/StatsView.vue')
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/CalendarView.vue')
  },
  {
    path: '/tmdb-search',
    name: 'TmdbSearch',
    component: () => import('../views/TmdbSearchView.vue')
  },
  {
    path: '/me',
    name: 'Me',
    component: () => import('../views/MeView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
