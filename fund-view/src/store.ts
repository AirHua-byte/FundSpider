import { createStore } from 'vuex'
import {
  login,
  logout,
  register,
  targetFund,
  targetOptionFund,
  getRules,
  setRules,
  addOptionFund,
  removeOptionFund,
  subscribe,
  isSubscribe,
  unSubscribe
} from './api/private'
import { message, notifiaction } from './utils/util'

const store = createStore({
  state: {
    token: localStorage.getItem('username') || '',
    isLogin: false,
    username: '',
    targetFund: [],
    targetLength: 0,
    optionFund: [],
    optionLength: 0,
    rules: {},
    isSubscribe: false
  },
  mutations: {
    mLogin(state, payload) {
      state.token = payload.username
      state.isLogin = true
      state.username = payload.username
      localStorage.setItem('username', payload.username)
    },
    mLogout(state) {
      state.token = ''
      state.isLogin = false
      state.username = ''
      localStorage.setItem('username', null)
      state.targetFund = []
      state.targetLength = 0
      state.optionFund = []
      state.optionLength = 0
      state.isSubscribe = false
    },
    getTargetFund(state, payload) {
      state.targetFund = payload
      state.targetLength = payload.length
    },
    getOptionFund(state, payload) {
      state.optionFund = payload
      state.optionLength = payload.length
    },
    mRules(state, payload) {
      state.rules = payload
    },
    mSubscribe(state) {
      state.isSubscribe = true
    }
  },
  actions: {
    loginAction({ state, commit }, payload) {
      login(payload)
        .then((data) => {
          if (data.toString() === 'error') {
            message('error', '登录失败, 请检查密码后重试')
          } else {
            message('success', '登录成功')
            commit('mLogin', data)
            this.dispatch('initAction', state.username)
          }
        })
    },
    logoutAction({ commit }) {
      logout().then((msg) => {
        if (msg.toString() === 'OK') {
          message('success', '退出登录成功')
          commit('mLogout')
        }
      })
    },
    registerAction({ state, commit }, payload) {
      register(payload)
        .then(data => {
          if (data.toString() === 'success') {
            message('success', '注册成功, 正在登录...')
            this.dispatch('loginAction', payload)
          }
        })
    },
    initAction({ state, commit }) {
      const username = window.localStorage.getItem('username')
      if (username !== 'undefined' && username !== 'null') {
        commit('mLogin', { username: username })
        this.dispatch('targetAction')
        this.dispatch('optionAction')
        this.dispatch('getRulesAction')
        this.dispatch('isSubscribeAction')
      }
    },
    targetAction({ state, commit }) {
      targetFund(state.username)
        .then((data) => {
          commit('getTargetFund', data)
        })
    },
    optionAction({ state, commit }) {
      targetOptionFund(state.username)
        .then((data) => {
          commit('getOptionFund', data)
        })
    },
    getRulesAction({ state, commit }) {
      getRules(state.username)
        .then(data => {
          commit('mRules', data)
        })
    },
    setRulesAction({ state, commit }, payload) {
      setRules(state.username, payload)
      this.dispatch('initAction')
      notifiaction('success', '提交成功')
    },
    setCodeAction({ state, commit }, payload) {
      addOptionFund(state.username, payload)
        .then(data => {
          if (data.toString() === 'repeat') {
            notifiaction('warning', '你已经添加过该基金')
          } else {
            // 针对不存在的基金 后端接口未处理
            commit('getOptionFund', data)
            notifiaction('success', '添加成功')
          }
        })
    },
    removeCodeAction({ state, commit }, payload) {
      removeOptionFund(state.username, payload)
        .then(data => {
          commit('getOptionFund', data)
          notifiaction('success', '取消成功')
        })
    },
    setEmailAction({ state, commit }, payload) {
      subscribe(state.username, payload)
        .then(data => {
          if (data.toString() === 'OK') {
            commit('mSubscribe')
            notifiaction('success', '订阅成功')
          }
        })
    },
    isSubscribeAction({ state, commit }, payload) {
      isSubscribe(state.username)
        .then(data => {
          if (data.toString() === 'YES') {
            state.isSubscribe = true
          } else {
            state.isSubscribe = false
          }
        })
    },
    unSubscribeAction({ state, commit }) {
      unSubscribe(state.username)
        .then(data => {
          if (data.toString() === 'OK') {
            state.isSubscribe = false
            notifiaction('success', '取消订阅成功')
          }
        })
    },

  },
  getters: {
    isLogin(state) {
      return state.isLogin
    },
    targetFund(state) {
      return state.targetFund
    },
    optionFund(state) {
      return state.optionFund
    },
    targetLength(state) {
      return state.targetLength
    },
    optionLength(state) {
      return state.optionLength
    },
    isSubscribe(state) {
      return state.isSubscribe
    }
  }
})

export default store
