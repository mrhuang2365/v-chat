import Vue from 'vue'
import Vuex from 'vuex'
import { getUserInfo, setUserInfo } from '../util/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: getUserInfo() || {}
  },
  getters: {
    userInfo (state) {
      return state.userInfo
    }
  },
  mutations: {
    userInfo (state, value) {
      state.userInfo = value
      setUserInfo(value)
    }
  }
})
