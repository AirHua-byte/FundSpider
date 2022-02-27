import { RuleItem } from "./rule";
// import { CSSProperties } from 'vue'

import { ValidateFieldsError } from 'async-validator'
interface Callback {
  (isValid?: boolean, invalidFields?: ValidateFieldsError): void,
}

// 表单每一项的配置选项
export interface FormOptions {
  // 表单显示的元素
  type: 'cascader'
  | 'checkbox-group'
  | 'checkbox'
  | 'color-picker'
  | 'date-picker'
  | 'input'
  | 'input-number'
  | 'radio'
  | 'radio-group'
  | 'rate'
  | 'select'
  | 'slider'
  | 'switch'
  | 'time-picker'
  | 'time-select'
  | 'transfer'
  | 'upload'
  | 'editor',
  // 表单项的值
  value?: any,
  // 表单项label
  label?: string,
  // 表单项标识
  prop?: string,
  // 表单项验证规则
  rules?: RuleItem[],
  // 表单占位符
  placeholder?: string,
  // 表单元素特有属性
  attrs?: {
    clearable?: boolean,
    showPassword?: boolean,
    colors?: string[],
  },
  // 表单项子元素
  children?: FormOptions[],
  // 处理上传组件属性和方法
  uploadAttrs?: {
    action?: string,
    headers?: object,
    drag?: boolean,
    method?: 'post' | 'put' | 'patch',
    multiple?: boolean,
    data?: object,
    name?: string,
    withCredentials?: boolean,
    showFileList?: boolean,
    accept?: string,
    thumbnailMode?: boolean,
    fileList?: any[],
    listType?: string,
    autoUpload?: boolean,
    disabled?: boolean,
    limit?: number
  }
}

export interface ValidateFieldCallback {
  (message?: string, invalidFields?: ValidateFieldsError): void,
}

export interface FormInstance {
  registerLabelWidth(width: number, oldWidth: number): void,
  deregisterLabelWidth(width: number): void,
  autoLabelWidth: string | undefined,
  emit: (evt: string, ...args: any[]) => void,
  labelSuffix: string,
  inline?: boolean,
  model?: Record<string, unknown>,
  size?: string,
  showMessage?: boolean,
  labelPosition?: string,
  labelWidth?: string,
  rules?: Record<string, unknown>,
  statusIcon?: boolean,
  hideRequiredAsterisk?: boolean,
  disabled?: boolean,
  validate: (callback?: Callback) => Promise<boolean>,
  resetFields: () => void,
  clearValidate: (props?: string | string[]) => void,
  validateField: (props: string | string[], cb: ValidateFieldCallback) => void,
}

export interface TargetFund {
  Trend: string,
  Url: string,
  assetScale: string,
  code: string,
  fundName: string
}

export interface Rules {
  FallingOnemonth: number | string,
  fallingOneweek: number | string,
  risingFromyear: number | string,
  risingOnemonth: number | string,
  risingOneweek: number | string,
  risingOneyear: number | string,
  risingSixmonth: number | string,
  risingThreemonth: number | string,
  risingThreeyear: number | string,
  risingTwoyear: number | string,
  userName: string
}

export interface FundInfo {
  fundCode: string,
  fundName: string,
  fundNameShort: string,
  fundType: string,
  releaseDate: string,
  buildDate: string,
  assetScale: string,
  shareScale: string,
  administrator: string,
  custodian: string,
  manager: string,
  bonus: string,
  managementRate: string,
  trusteeshipRate: string,
  saleServiceRate: string,
  subscriptionRate: string
}

export interface Info {
  date: string,
  unitNet: string,
  accumulatedNet: string,
  changePercent: string
}