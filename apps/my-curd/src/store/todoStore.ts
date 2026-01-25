import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import dayjs from 'dayjs'

// 待办项类型定义
interface TodoItem {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

// Zustand待办状态管理模型
interface TodoStore {
  todos: TodoItem[]
  status: 'idle' | 'loading' | 'succeed' | 'failed'
  error: string | null
  // 待办项操作方法
  addTodo: (title: string) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
  updateTodo: (id: string, title: string) => void
  clearCompleted: () => void
  setTodo: (todos: TodoItem[]) => void
  fetchTodo: () => Promise<void>
}

// 创建Zustand待办仓库（支持持久化）
export const useTodoStore = create<TodoStore>()(
  persist((set) => ({
    todos: [],
    status: 'idle',
    error: null,
    // 新增待办项
    addTodo: (title) =>
      set((state) => ({
        todos: [...state.todos,
        { id: Date.now().toString(), title, completed: false, createdAt: new Date() }],
      })),
    // 切换待办项完成状态
    toggleTodo: (id) =>
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo),
      })),
    // 删除指定待办项
    deleteTodo: (id) =>
      set((state) => ({
        todos: state.todos.filter((todo) =>
          todo.id !== id),
      })),
    // 更新待办项内容
    updateTodo: (id, title) =>
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, title } : todo),
      })),
    // 清空已完成待办项
    clearCompleted: () =>
      set((state) => ({
        todos: state.todos.filter((todo) =>
          todo.completed === false)
      })),
    // 批量替换待办列表
    setTodo: (todos) => set({ todos }),
    // 异步加载待办列表（模拟接口请求）
    fetchTodo: async () => {
      try {
        set({ status: 'loading', error: null });
        const res = await fetch('https://api.example.com/todos');
        const data: TodoItem[] = await res.json();
        set({ todos: data, status: 'succeed' });
      } catch (err) {
        set({ status: 'failed', error: err instanceof Error ? err.message : '请求失败' })
      }
    },
  }),
  { name: 'todo-storage' }))

// 表单值类型定义
interface FormValues {
  username: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  education: string;
  skills: string[];
  startDate: [dayjs.Dayjs, dayjs.Dayjs];
  bio: string;
  agreement: boolean
}

// Zustand表单状态管理模型
interface FormStore {
  // 表单核心状态
  formLoading: boolean;
  formDraft: Partial<FormValues>;
  formSubmitHistory: FormValues[];
  // 登录状态（权限控制）
  isLogin: boolean;
  // 表单操作方法
  setFormDraft: (draft: Partial<FormValues>) => void;
  setFormLoading: (loading: boolean) => void;
  addSubmitHistory: (data: FormValues) => void;
  setLogin: (status: boolean) => void;
}

// 创建Zustand表单仓库（支持持久化）
export const useFormStore = create(
  persist<FormStore>(
    (set) => ({
      // 初始化状态
      formLoading: false,
      formDraft: {},
      formSubmitHistory: [],
      isLogin: false,
      
      // 更新表单草稿
      setFormDraft: (draft) => set((state) => ({
        formDraft:{...state.formDraft,...draft}
      })),
      // 设置表单加载状态
      setFormLoading: (loading) => set({ formLoading:loading}),
      // 添加表单提交历史
      addSubmitHistory: (data) => set((state) => ({
        formSubmitHistory: [...state.formSubmitHistory, data]
      })),
      // 设置登录状态
      setLogin: (status) => set({ isLogin: status})
      
    }),
    {
      name: "form-storage",
    }
  )
)