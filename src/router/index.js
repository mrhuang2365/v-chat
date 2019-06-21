import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: (r) => require.ensure([], () => r(require('@/pages/home.vue')))
    },
    {
      path: '/HelloWorld',
      name: 'HelloWorld',
      component: (r) => require.ensure([], () => r(require('@/components/HelloWorld')))
    }
  ]
})
