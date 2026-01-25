import axios from 'axios'
import { message } from 'antd'
import { useFormStore } from '../store/todoStore'

// 创建axios实例并统一配置全局请求
const request = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com', // 模拟接口地址
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8' // 标准JSON请求头
  }
})

// 请求拦截器：添加身份认证Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// 响应拦截器：统一处理响应结果与错误
request.interceptors.response.use((response) => {
  // 统一返回后端业务数据，简化业务端调用
  return response.data
}, (error) => {
  // 统一错误提示
  const errMsg = error.response?.data?.message || error.message || '请求失败，请稍后重试'
  message.error(errMsg)

  // 401未授权：清空登录状态并跳转登录页
  if (error.response?.status === 401) {
    useFormStore.getState().setLogin(false)
    window.location.href = '/login'
    localStorage.removeItem('token')
  }

  return Promise.reject(error)
})

export default request