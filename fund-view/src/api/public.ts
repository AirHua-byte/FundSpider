import request from '../utils/request'

/**
 * 获取所有基金代码
 * 说明 : 调用此接口 , 可获得所有基金代码
 */
export function getAllCodes() {
  return request({
    url: '/fetchFundCodes',
    method: 'get'
  })
}

/**
 * 获取基金基本信息
 * 说明 : 调用此接口, 传入基金代码code, 可获取基金规模, 类型等基本信息
 */
export function getFundInfo(code: string) {
  return request({
    url: `/fetchFundInfo/${code}`,
    method: 'get'
  })
}

/**
 * 获取基金阶段涨幅
 * 说明 : 调用此接口, 传入基金代码code, 可获取基金阶段情况
 */
export function getFundstage(code: string) {
  return request({
    url: `/fundstage/${code}`,
    method: 'get'
  })
}

/**
 * 获取基金阶段日涨跌情况
 * code: 基金代码
 * stage取值：oneweek | onemonth | threemonth | sixmonth | oneyear | threeyear
 */
export function getStageInfo(code: string, stage: string) {
  return request({
    url: `/fetchFundData/${code}/${stage}`,
    method: 'get'
  })
}
