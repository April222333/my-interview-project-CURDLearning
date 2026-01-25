//Axios二次封装：
//专门放 axios 封装，整个项目的所有接口都用这个封装后的实例，TodoList 的增删改查也能复用
import axios from 'axios'
import { message } from 'antd'
import { useFormStore } from '../store/todoStore'//导入你的 zustand 状态仓库，用于401 时修改登录状态，完美贴合你的项目

//导入的 axios 本身是一个默认实例，可以直接调用 axios.get()
//而axios.create(config)也可以创建新实例

//Axios的interceptors拦截器【核心】：
//Axios的两类拦截器：
//请求拦截器 request.interceptors.request.use(成功回调，失败回调)-请求发往服务器之前执行
//响应拦截器 request.interceptors.respones.use()-服务器返回数据后，业务代码拿到数据之前执行
//拦截器底层执行顺序【重要】：
//业务代码调用 request.get()
//  ↓
//进入【请求拦截器】→ 加token、加请求头、配置参数（你的代码逻辑）
//  ↓
//请求真正发送到后端服务器
//  ↓
//服务器返回响应数据
//  ↓
//进入【响应拦截器】→ 格式化数据、统一错误处理、401跳转（你的代码逻辑）
//  ↓
//处理后的结果返回给业务代码的 .then() / .catch()


// 创建axios实例，统一配置全局请求
const request = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',// 免费的模拟接口地址
  timeout: 10000,// 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'//设置全局请求头，告诉后端「我传给你的数据格式是什么」
    //application/json;charset=utf-8 是前后端分离项目的【标准请求头】，表示请求体是 JSON 格式，编码是 utf-8，几乎所有项目都用这个
  }
})

//请求拦截器：请求发出去之前做的事-加token，加请求头
request.interceptors.request.use((config) => {
  //从zustand里取token（todolist的登录token，这里模拟，实际项目从localStorage/zustand取
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    //如果有 token，就给请求头加「身份认证字段」
    //底层逻辑：Authorization 是 HTTP 协议的标准身份认证请求头，Bearer 是认证方式（表示是 JWT 令牌），后端会从这个请求头里获取 token，判断用户是否登录 / 权限是否合法
  }
  return config
  //返回配置，正常发送请求
}, (error) => {
  return Promise.reject(error)//因为Axios所有请求（get/post)都是Promise异步请求,拦截器的回调函数也必须遵循 Promise 规范
  //成功的逻辑用「默认返回成功值」即可，失败的逻辑必须手动 return Promise.reject(error)，把错误抛出去，这样业务代码里的 .catch() 才能捕获到错误，按需处理
})
//你的代码只做了最核心的「加 token」，这个拦截器还可以拓展很多通用逻辑：统一加公共参数、请求时显示全局 loading、对请求参数做序列化处理等，都是在这里加。





//(成功回调，失败回调：请求发送成功，但服务器返回了错误状态码4xx/5xx，或请求超时，网络错误等，都会进入这个回调)
//响应拦截器：请求回来之后做的事-统一处理成功/失败，统一报错，401跳转
request.interceptors.response.use((response) => {
  //原生Axios请求后，返回的response是一个【大对象】，而这里统一返回后端的data数据，不用每次请求都写.data，业务端能直接拿到要的数据
  return response.data //响应拦截器最核心的优化！！
}, (error) => {
  //统一错误提示
  const errMsg = error.response?.data?.message || error.message || '请求失败，请稍后重试'
  //?. 是 ES6 的可选链操作符
  message.error(errMsg)

  //401未授权：token过期/未登录，自动跳转登录项+清空登录状态
  if (error.response?.status === 401) {
    //401 的含义：HTTP 标准状态码 → 未授权 / 身份认证失败，原因只有两个：token过期 或 用户未登录
    useFormStore.getState().setLogin(false) //调用zustand的方法，把登录状态改为false
    //因为拦截器里不能直接调用 hooks，必须用getState()获取仓库的状态和方法
    window.location.href = '/login'  // 强制跳转到登录页，需重新输入账号密码，形成闭环
    localStorage.removeItem('token')// 清空本地的过期token
  }

  return Promise.reject(error)
})

export default request



//原生Axios请求后，返回的response是一个【大对象】的结构：
//{
//   data: { /* 后端真正返回的业务数据，比如列表、详情 */ },
//   status: 200, // HTTP状态码
//   statusText: 'OK',
//   headers: {}, // 响应头
//   config: {} // 请求配置
// }

//为什么项目里必须用token?
//http协议是【无状态协议】，服务器不会记住任何一次请求的状态。每次都需要输入账号密码太麻烦，Token 的出现，就是为了给「无状态的 HTTP」加上「状态」
//逻辑闭环，账号密码登录成功-后端发【身份凭证token】给前端->前端保存这个凭证，每次请求都带上这个凭证，后端通过凭证识别【我已是登录用户】，正常返回数据，凭证失效，需要重新获取

//token存在哪里？
//token 存在 localStorage，登录状态（isLogin）存在 zustand/useState

//Authorization 是 HTTP 协议的标准请求头，专门用来存放「身份认证信息」，后端会固定从这个请求头里读取 Token，这是前后端的约定，全世界都这么写

//为什么要写 Bearer ${token}？
//Bearer 是「认证方式」，表示这个 Token 是 JWT 令牌（最主流的 Token 格式），Bearer 和 token 之间必须有一个空格！

//token 是一串加密的随机字符串，没有固定长度，它是加密的，前端不需要知道里面存了什么，只需要「存起来、发请求时带出去」就行。

//token和账号密码的区别？
//账号密码：是用户的「登录凭证」，只有登录时用一次，验证身份；
//token：是用户的「访问凭证」，登录成功后获取，后续所有请求都用它，验证身份
//核心：账号密码是「敏感信息」，绝对不能在请求里随便传；Token 是「加密凭证」，可以放心传

//token完整工作流程：
// 1.登录成功，前端【储存token】：
//登录组件：
//const handleLogin = async (values) => {
//   const res = await request.post('/login', values) // 传账号密码给后端
//   const token = res.token // 后端返回的token字符串
//   localStorage.setItem('token', token) // 把token存入本地存储
//   useFormStore.getState().setLogin(true) // zustand把登录状态改为true
//   window.location.href = '/' // 跳转到首页
// }
// 2.请求拦截器，「携带 Token 发请求」，此页39行代码
// 3.后端「校验 Token」：1从Authorization里取出token，2校验token合法性，合法返回请求数据，不合法返回401
// 4.响应拦截器，「处理 Token 失效（401）」,此页代码61
// 5.强制返回登录界面后，重新登录，获取新的token（之后前端再次储存，流程重新闭环）


//axios二次封装，本质上就是围绕 token的身份认证 做了一套完整的，全局的，自动化的处理逻辑：自动带token发请求，自动处理token失效的情况，全项目复用，不用在每个接口重新写，
