import { ElMessage, ElNotification } from 'element-plus';
import { Info } from '../types/types'

export const setData = (data: Array<Info>) => {
  let trendArr = [];
  data.map((item, index) => {
    if (index == 0) {
      trendArr.push(0.00);
    } else {
      var tempNum = item.changePercent.slice(0, item.changePercent.length - 1);
      var num = (1 + trendArr[index - 1] / 100) * (1 + Number(tempNum) / 100) - 1;
      trendArr.push((parseFloat(num.toString()) * 100).toFixed(2));
    }
  })
  const obj = { x: [], y: [] };
  data.map((item, idx) => {
    obj.x.push(item.date);
    obj.y.push(trendArr[idx]);
  });
  return obj;
};

export const notifiaction = (type: 'error' | 'success' | 'warning', msg: string) => {
  if (type === 'success') {
    ElNotification.success({
      title: 'Success',
      message: msg,
      offset: 100,
    })
  }
  if (type === 'warning') {
    ElNotification.warning({
      title: 'Warning',
      message: msg,
      offset: 100,
    })
  }
  if (type === 'error') {
    ElNotification.error({
      title: 'Error',
      message: msg,
      offset: 100,
    })
  }
}

export const message = (type: 'error' | 'success' | 'warning', msg: string) => {
  if (type === 'success') {
    ElMessage.success(msg)
  }
  if (type === 'warning') {
    ElMessage.warning(msg)
  }
  if (type === 'error') {
    ElMessage.error(msg)
  }
}