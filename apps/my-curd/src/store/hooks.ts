import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import { RootState, AppDispatch } from './index'

// 自定义类型安全的Redux Hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector