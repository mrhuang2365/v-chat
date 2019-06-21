// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import './lib/index'

import YDUI from 'vue-ydui' /* 相当于import YDUI from 'vue-ydui/ydui.rem.js' */
import 'vue-ydui/dist/ydui.rem.css'
import { Input } from 'vue-ydui/dist/lib.px/input'

import http from './lib/http'

Vue.component(Input.name, Input)

Vue.prototype.$http = http

Vue.config.productionTip = false

Vue.use(YDUI)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
