import request from '../utils/request'

/**
 * 注册接口
 * username: 账号-用户名
 * password: 密码后端加密
 * @data {string} params.username
 * @data {string} params.password
 */
export function register(data) {
  return request({
    url: '/register',
    method: 'post',
    data
  })
}

/**
 * 登录接口
 * username: 账号-用户名
 * password: 密码后端加密验证
 * @data {string} params.username
 * @data {string} params.password
 */
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

/**
 * 退出登录
 */
export function logout() {
  return request({
    url: '/logout',
    method: 'get'
  })
}

/**
 * 获取筛选基金结果
 * @param {string} params.username
 */
export function targetFund(username) {
  return request({
    url: '/fundtarget',
    method: 'get',
    params: {
      username
    }
  })
}

/**
 * 获取自选基金信息
 * @param {string} params.username
 */
export function targetOptionFund(username) {
  return request({
    url: '/optiontarget',
    method: 'get',
    params: {
      username
    }
  })
}

/**
 * 查询筛选规则
 * @param {string} params.username
 */
export function getRules(username) {
  return request({
    url: '/currentrule',
    method: 'get',
    params: {
      username
    }
  })
}

/**
 * 修改筛选规则
 * @param {string} params.username
 * @param {object} params.rules
 */
export function setRules(username: string, rules: object) {
  return request({
    url: '/rules',
    method: 'get',
    params: {
      username,
      rules
    }
  })
}

/**
 * 新增自选基金
 * @param {string} params.username
 * @param {string} params.code
 */
export function addOptionFund(username: string, code: string) {
  return request({
    url: '/addoption',
    method: 'get',
    params: {
      username,
      code
    }
  })
}

/**
 * 移除自选基金
 * @param {string} params.username
 * @param {string} params.code
 */
export function removeOptionFund(username: string, code: string) {
  return request({
    url: '/removeoption',
    method: 'get',
    params: {
      username,
      code
    }
  })
}

/**
 * 订阅邮箱报表
 * @param {string} params.username
 * @param {string} params.email
 */
export function subscribe(username: string, email: string) {
  return request({
    url: '/subscribe',
    method: 'get',
    params: {
      username,
      email
    }
  })
}

/**
 * 判断是否订阅邮箱报表
 */
export function isSubscribe(username: string) {
  return request({
    url: '/issubscribe',
    method: 'get',
    params: {
      username
    }
  })
}

/**
 * 取消订阅
 */
export function unSubscribe(username: string) {
  return request({
    url: '/unsubscribe',
    method: 'get',
    params: {
      username
    }
  })
}
