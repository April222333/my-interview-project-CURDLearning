import 'antd/dist/reset.css'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivatRoute' // 导入私有路由组件
import { useFormStore } from './store/todoStore'; // 导入 Zustand 仓库
import React, { lazy, Suspense } from 'react';
//路由懒，从全量加载变为 按需加载页面组件
import {Tabs, Spin} from 'antd'
//根组件，页面容器，引入并渲染你的 TodoList 组件（最简版只渲染 TodoList）
// ✅ 核心：路由懒加载 - 动态导入组件（替代原来的静态import）
// 格式：const 组件名 = lazy(() => import('组件路径'));
// React.lazy 仅支持默认导出
const TodoList = lazy(() =>import('./pages/TodoList'));
const FormPage = lazy(() => import("./pages/FormPage"));
const BlankPage =lazy(()=> import('./pages/BlankPage'))
const LoginPage = lazy(() => import("./pages/LoginPage")); // 加上登录页的懒加载
//若你的 React 项目使用 Webpack/Vite 等前端打包工具，推荐使用 moduleResolution: "bundler"（该选项专为前端打包工具设计，适配 React 项目的开发习惯，无需强制写文件扩展名）
// import TodoList from "./pages/TodoList";
// import FormPage from './pages/FormPage'
// import BlankPage from './pages/BlankPage'




//导航逻辑抽离为独立的 Navigation 组件，和业务解耦，可复用
const Navigation = () => {
  const location = useLocation()
  const navigate=useNavigate()

  const items = [
    {
      key: '/',  //自定义路径，只要和后面Rout组件path一样， 那就能把tabs和路由联系在一起
      label:'审批列表'
    },
    {
      key: '/form',
      label:'表单页面'
    },
    {
      key: '/blank',
      label:'空白页面'
    },
    { key: '/login', label: '登录页面' } 
  ]
  
  return (
    <Tabs
      activeKey={location.pathname}
      items={items}
      onChange={(key) => {
        navigate(key as string) //联动路由跳转
        //路由跳转时的类型断言 key as string 合理，解决了 TS 类型推导问题
      }}
    />
  )
}

//主应用内容
const AppContent = () => {
  // 已登录状态：控制登录页跳转
  const isLogin = useFormStore(state => state.isLogin);
  return (
    <div className='container'style={{ padding: 16 }}>
      <Navigation />
      {/* ✅ 核心：Suspense包裹Routes，加载中显示Spin（Antd的加载组件） */}
      {/* fallback：懒加载组件加载时显示的占位内容，替换成你喜欢的样式也可以 */}
      {/* fallback 属性不能少：加载时显示占位（用 Antd 的 Spin 或简单的 Loading... 都可以 */}
      <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}><Spin size="large" tip="页面加载中..." /></div>}>
        <Routes>
       
          {/* 登录页：已登录则跳首页，未登录则显示登录页 */}
          <Route path='/login' element={isLogin ? <Navigate to='/' replace /> : <LoginPage />} />
             {/* 需权限的路由：用 PrivateRoute 包裹 */}
        <Route path='/' element={<PrivateRoute><TodoList/></PrivateRoute>} />
        <Route path='/form' element={<PrivateRoute> <FormPage/></PrivateRoute>} />
        <Route path='/blank' element={<PrivateRoute><BlankPage /></PrivateRoute>} />
           {/* 兜底路由：访问不存在的路径跳登录页 */}
        <Route path='*' element={<Navigate to='/login' replace />} /> 
      </Routes>
      </Suspense>
     
    </div>
  )
}
// Navigate 的 replace 属性必须加：避免用户通过浏览器回退按钮，回到无权限的页面；
// 登录页也要加权限判断：已登录的用户访问 /login 时自动跳首页，避免重复登录；
// 测试效果：未登录时点击「审批列表」，会自动跳登录页；登录后能正常访问所有页面，退出登录后又会限制访问。

// 路由懒加载：核心是 React.lazy+Suspense，按需加载组件，优化首屏性能，TS 自动适配；
// 动态权限控制：核心是封装 PrivateRoute 组件，结合 Zustand 的 isLogin 状态做判断，统一管理权限；
// 两个功能一起用：你的项目直接从「入门 demo」升级为「企业级项目」，简历加分效果翻倍；
// 无坑关键：路径写对、Suspense 不遗漏、replace 属性加好、TS 类型定义完整。

// 补充知识点：React 函数组件的返回值，还可以写React.ReactElement，和JSX.Element完全等价
const App = (): JSX.Element => { //TS语法规范 函数组件返回值标注():JSX.Element
  
  return (
      <Router>
        <AppContent />
      </Router>
  )
}

export default App;




//前端路由router-管理多个组件(页面)
//官方推荐的前端路由库 react-router-dom
//router特点：
    // 【无刷新跳转】，url变了但是并不会重新加载整个页面，只是页面里面的【内容组件】被替换了
    //核心能力：根据url地址，渲染对应的组件
//负责 全局/页面级的大切换
    
//AntD 的 <Tabs> 组件    

//哪些组件写在入口index.tsx，哪些组件写在根组件APP.tsx？？
//入口文件：
// 本质是【JS执行文件】，不是react组件，是整个项目的【启动开关】，最先执行，最外层。唯一作用：执行全局初始化逻辑，把react组件挂载到真实dom上
//可以访问全局API,执行全局方法（如store.dispatch）
//只会执行一次

//项目【根组件】（react组件数的【根节点】）：
//本质：标准的react函数组件，所有业务组件的【父容器】
//可以写react组件的所有逻辑，会被React重新渲染，当路由，状态变化时，APP组件会跟着重新渲染


//redux-persist的<PersistGat>不是普通的React组件，作为【全局持久化容器】，必须作为最顶层容器，包裹整个React应用
//<PersistGat>作用-在React 应用启动前，先从浏览器localStorage中读取持久化的 Redux 数据，加载完成后，再渲染你的 App 组件
//如果把它写在 App.tsx 里，会出现：App 组件已经渲染了，数据还没加载完成 → 页面会出现「数据空白 / 闪屏」，持久化失效，甚至报错

//这个写法是【职责彻底分离】：
//全局顶层容器（provider+persistgate)-写在index.tsx(入口执行文件，只执行一次，不渲染，只负责全局初始化)
//业务路由容器router+业务组件-写在app.tsx(根组件，负责业务逻辑，会渲染，不用关心全局redux持久化配置，组件复用更高)

//项目后续要加【全局插件】：国际化 (i18n)、全局权限控制、全局主题配置 等，只需要在 index.tsx 里加对应的容器