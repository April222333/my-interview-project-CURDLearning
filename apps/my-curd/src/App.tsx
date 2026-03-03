import 'antd/dist/reset.css'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivatRoute'
import { useFormStore } from './store/todoStore';
import React, { lazy, Suspense } from 'react';
import { Tabs, Spin } from 'antd'

// 路由懒加载：按需加载页面组件
const TodoList = lazy(() => import('./pages/TodoList'));
const FormPage = lazy(() => import("./pages/FormPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

// 路由与Tabs联动导航组件
const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { key: '/', label: '待办列表' },
    { key: '/form', label: '表单页面' },
    { key: '/login', label: '登录页面' }
  ];
  
  return (
    <Tabs
      activeKey={location.pathname}
      items={items}
      onChange={(key) => {
        navigate(key as string);
      }}
    />
  );
};

// 应用核心内容（路由与权限控制）
const AppContent = () => {
  const isLogin = useFormStore(state => state.isLogin);
  
  return (
    <div className='container' style={{ padding: 16 }}>
      <Navigation />
      {/* 懒加载组件加载中占位 */}
      <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}><Spin size="large" tip="页面加载中..." /></div>}>
        <Routes>
          {/* 登录页：已登录自动跳转首页 */}
          <Route path='/login' element={isLogin ? <Navigate to='/' replace /> : <LoginPage />} />
          {/* 需权限的页面：通过PrivateRoute控制访问权限 */}
          <Route path='/' element={<PrivateRoute><TodoList/></PrivateRoute>} />
          <Route path='/form' element={<PrivateRoute><FormPage/></PrivateRoute>} />
          {/* 兜底路由：访问不存在路径跳转登录页 */}
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

// 应用根组件
const App = (): JSX.Element => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;