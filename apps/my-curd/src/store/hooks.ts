import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import { RootState, AppDispatch } from './index'
  
//RootState 和 AppDispatch 的作用是为你的 Redux 应用提供完整的类型安全（Type Safety） （都是T类型）
//告诉 TypeScript 你的 Redux “仓库” 里有什么（RootState）以及你可以对仓库执行哪些操作（AppDispatch）

//type TypedUseSelectorHook：TypeScript 类型（注意前面的 type 关键字，这表示它只在编译时存在，不会被打包到最终的 JavaScript 文件中），它是一个类型工具，专门用来帮助我们创建一个类型安全的 useSelector

//自定义HOOK
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState>= useSelector