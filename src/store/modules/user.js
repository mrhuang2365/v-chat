import { getUserInfo, setUserInfo } from '@/util/auth'

export default {
  namespaced: true,
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
  },
  actions:{
    /**
     * @description 设置用户数据
     * @param {Object} state vuex state
     * @param {*} info info
     */
    set ({ commit, state }, info) {
      return new Promise(async resolve => {
        // store 赋值
        commit('userInfo', info)
        // 持久化
        // end
        resolve()
      })
    },
  }
}