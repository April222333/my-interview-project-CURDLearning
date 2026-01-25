import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux'
import { store, persistor } from './store' 
import { PersistGate } from 'redux-persist/integration/react'

// 应用入口：挂载根组件并配置全局状态管理
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    {/* Redux全局状态管理容器 */}
    <Provider store={store}>
      {/* Redux持久化容器：加载完成后渲染App */}
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <App /> 
      </PersistGate>
    </Provider>
  </React.StrictMode>
);