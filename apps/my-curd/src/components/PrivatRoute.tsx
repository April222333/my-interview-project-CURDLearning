//动态权限控制：未登录，访问审理列表，表单页面时，自动跳转到登录页面，不让访问
//  已登录：正常访问所有页面
//实现核心：封装【私有路由组件】，统一处理权限，解耦又好维护

import { Navigate } from 'react-router-dom';
import { useFormStore } from '../store/todoStore'; // 导入你的 Zustand 仓库

// TS 类型定义：接收要渲染的组件（children）
//私有路由组件必须接收 children 属性：用来传递要渲染的页面组件，TS 类型不能漏；
interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // 从 Zustand 取登录状态（你之前定义的 isLogin）
  const isLogin = useFormStore(state => state.isLogin);

  // 核心权限逻辑
  if (!isLogin) {
    // 未登录 → 跳转到登录页（replace: true 避免回退到无权限页面）
    return <Navigate to='/login' replace />;
  }

  // 已登录 → 渲染要访问的组件（比如 TodoList/FormPage）
  return <>{children}</>;
};

export default PrivateRoute;