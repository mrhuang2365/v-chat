import Vue from 'vue'
import Vuex from 'vuex'
import { getUserInfo, setUserInfo } from '../util/auth'

Vue.use(Vuex)

const files = require.context('./modules', false, /\.js$/)
const modules = {}

files.keys().forEach(key => {
  modules[key.replace(/(\.\/|\.js)/g, '')] = files(key).default
})


export default new Vuex.Store({
  modules
})
