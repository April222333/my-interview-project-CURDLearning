import { configureStore } from '@reduxjs/toolkit'
import todoReducer from './todoSlice'

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' //这就是 localStorage 的封装


//1.配置持久化规则-核心作用：自动保存，自动恢复
const persistConfig = {
  key: 'root', // 持久化数据的根键名（随便起，比如叫 'root'）
  storage, // 指定用 localStorage 存储, 如果想排除某个，用 blacklist: ['xxx']
}
//2.用persist包装reducer
const persistedTodoReducer = persistReducer(persistConfig, todoReducer)

//3.创建store
export const store = configureStore({
  reducer: {
    todos:persistedTodoReducer
  },
   //4.加个中间键配置（解决redux-persisi和RTK的兼容性问题）
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck:false//允许储存非序列化数据（比如data对象）
  })
  //RTK内置中间键是默认仅支持可序列化的，确保JSO.stringfy()成功转成JSON字符。但是redux-persist，redux DevTools都依赖于将状态序列化为字符串来工作，如果状态里有不可序列化的数据，可能会导致持久化失败或调试功能异常。


})

//创建persistor
export const persistor= persistStore(store)

//导出dispatch 和 selector的TS自定义安全类型，方便自定义HOOK
export type RootState = ReturnType<typeof store.getState>; 
export type AppDispatch = typeof store.dispatch //rtk自带增强thunk，可用异步

// Redux 的状态读取和 dispatch 操作获得严格的类型校验与智能提示