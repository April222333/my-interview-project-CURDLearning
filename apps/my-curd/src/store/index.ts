import { configureStore } from '@reduxjs/toolkit'
import todoReducer from './todoSlice'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // 基于localStorage的封装

// 配置redux-persist持久化规则
const persistConfig = {
  key: 'root', // 持久化数据根键名
  storage, // 使用localStorage存储数据
}

// 包装reducer以支持持久化
const persistedTodoReducer = persistReducer(persistConfig, todoReducer)

// 创建Redux Store实例
export const store = configureStore({
  reducer: {
    todos: persistedTodoReducer
  },
  // 配置中间件解决redux-persist与RTK的兼容性问题
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false // 允许存储非序列化数据
  })
})

// 创建persistor实例用于持久化管理
export const persistor = persistStore(store)

// 导出TypeScript类型以支持类型安全的状态操作
export type RootState = ReturnType<typeof store.getState>; 
export type AppDispatch = typeof store.dispatch