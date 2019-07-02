import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '*',
      redirect: '/',
    },
    {
      path: '/',
      name: 'home',
      component: (r) => require.ensure([], () => r(require('@/pages/home.vue')))
    },
    {
      path: '/login',
      name: 'login',
      component: (r) => require.ensure([], () => r(require('@/pages/login.vue')))
    }
  ]
})
