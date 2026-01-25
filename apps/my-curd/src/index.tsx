import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux'

import { store,persistor } from './store' 

//持久化引入PersistGate
import { PersistGate } from 'redux-persist/integration/react'
// 用 PersistGate 包裹 App，

//项目入口文件
const root = ReactDOM.createRoot(document.getElementById('root')!);
// 加 ! 断言非 null
//ReactDOM.createRoot 是 React 18 引入的新方法，核心作用是创建 React 应用的 “根容器实例”，负责把 React 组件树挂载到页面的 DOM 元素上，并管理后续的渲染、更新流程

//ReactDOM.createRoot(...) 找到页面的 root DOM 节点，创建根实例；
//root.render(...) 把 <App /> （以及外层的 Redux Provider、StrictMode）渲染到这个根节点中，完成 React 应用的启动。

root.render(
  <React.StrictMode>
    <Provider store={store}>
    {/* loading 是加载时显示的内容（可以自定义） */}
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          <App /> 
      </PersistGate>
      </Provider>
  </React.StrictMode>
);

