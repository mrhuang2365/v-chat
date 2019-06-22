import router from './index'
import {getToken} from '../util/auth'

const _d = require('debug')('js:routerCtrl')

router.beforeEach((to, from, next) => {
  if (!getToken()) {
    _d('beforeEach', to.path, from.path)
    if (to.path !== '/login') {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})
