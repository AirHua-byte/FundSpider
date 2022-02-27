import axios from 'axios'

const service = axios.create({
  baseURL: 'http://fundadm.huabyte.com/',
  timeout: 10000
})

service.interceptors.response.use(
  response => {
    const res = response.data
    return res
  },
  error => {
    return Promise.reject(error)
  }
)

export default service;