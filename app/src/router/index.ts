import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
// import Popular from '../views/PopularList.vue'
import Auth from '@/utils/auth'
import ContactCard from '../components/ContactCard.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Popular',
    component: () => import(/* webpackChunkName: "about" */ '../views/PopularList.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "about" */ '../views/LoginView.vue')
  },
  {
    path: '/hunter/:id',
    name: 'Hunter',
    component: ContactCard

  },
  {
    path: '/search',
    name: 'Search',
    component: () => import(/* webpackChunkName: "about" */ '../views/SearchPage.vue')
  },
  {
    path: '/previous',
    name: 'Previous',
    component: () => import(/* webpackChunkName: "about" */ '../views/PreviousList.vue')
  },
  {
    path: '/today',
    name: 'Today',
    component: () => import(/* webpackChunkName: "about" */ '../views/TodayList.vue')
  },
  {
    path: '/report',
    name: 'RequestAndReport',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/ReportRequest.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/submit',
    name: 'Submit',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/SubmitProjectForm.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/me',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "about" */ '../views/ProfilePage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import(/* webpackChunkName: "about" */ '../views/FavoritesList.vue'),
    meta: {
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})
router.beforeEach(async (to) => {

  if (Auth.loggedIn() == false && to.meta.requiresAuth) {
    // redirect the user to the login page
    return { path: '#/login' }
  }
})

export default router
