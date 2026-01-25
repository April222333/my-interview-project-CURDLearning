//动态权限控制：
//未登录，访问审理列表/表单页面时自动跳转登录页，禁止访问；已登录则正常访问所有页面


import { Navigate } from 'react-router-dom';
import { useFormStore } from '../store/todoStore'; 

// 私有路由组件：必须接收children属性，用于传递需渲染的页面组件
interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // 从 Zustand 取登录状态
  const isLogin = useFormStore(state => state.isLogin);

  // 核心权限逻辑
  if (!isLogin) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;