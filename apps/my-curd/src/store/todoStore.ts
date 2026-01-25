import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import dayjs from 'dayjs'

// import {immer} from 'zustand/middleware/immer'

interface TodoItem {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

interface TodoStore{
  todos: TodoItem[]
  //异步状态
  status: 'idle' | 'loading' | 'succeed' | 'failed'
  error: string | null
  //方法（增删改查）
  addTodo: (title: string) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
  updateTodo: (id: string, title: string) => void //id定位，title改的内容
  clearCompleted:()=>void

  setTodo: (todos: TodoItem[]) => void //批量替换
  fetchTodo: ()=> Promise<void> //异步方法？

}
//两个括号，函数柯里化curring，把原本需要此次换传入的参数，拆成多次传入
//Zustand 这么设计主要是为了更好的 TypeScript 类型推导 + 支持中间件（比如 persist）的灵活组合


//zustand不内置immer，所以必须手动保证状态的的 不可变性。若直接写state.todos.push(新todo)，会导致状态不更新
//状态不可变原则： 原因是React的 更新机制 依赖 状态的引用变化 来检测更新，直接修改不会产生新的引用(新地址)，react检测不到变化，所以组件不会重新渲染，看起来就像 状态没更新
  //状态是「原始类型」（数字、字符串、布尔）：值变了，就认为状态变了
  //状态是「引用类型」（数组、对象）：只有引用（地址）变了，才认为状态变了
export const useTodoStore = create<TodoStore>()(
  persist((set) => ({ //zustand刻意把set里的state参数设计为 仅包含状态/可变字段，不包含方法
    todos: [],  //初始化状态 
    status: 'idle',
    error: null,
    addTodo: (title) =>
      set((state) => ({
        todos: [...state.todos,
        { id: Date.now().toString(), title, completed: false, createdAt: new Date() }],
      })),
    toggleTodo: (id) => //这里的state应该
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo),
      })),
    
    //删除某个元素用filter对整个数组做处理，返回新数组（新引用）
    deleteTodo: (id) =>
      set((state) => ({
        todos: state.todos.filter((todo) =>
          todo.id !== id),
      })),
    
    //必须用map，是因为map遍历所有元素，对元素做处理后返回长度不变的新数组（改变引用）
    //find，遍历数组并找到对应的元素，返回对应的元素，没有生成新数组（不可用）
    updateTodo: (id, title) =>
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, title } : todo),
      })),
    
    clearCompleted: () =>
      set((state) => ({
        todos: state.todos.filter((todo) =>
          todo.completed === false)
      })),
    
    setTodo: (todos) => set({ todos }),
    
    //新增异步方法（模拟接口请求）
    fetchTodo: async () => {
      try {
        //1.请求前
        set({ status: 'loading', error: null });
        //2. 模拟接口请求（实际项目中用 axios/fetch）
        const res = await fetch('https://api.example.com/todos');
        const data: TodoItem[] = await res.json();
        //3.请求成功 更新todos+状态
        set({ todos: data, status: 'succeed' });
      } catch (err) {
        //4.请求失败
        set({ status: 'failed', error: err instanceof Error ? err.message : '请求失败' })
      }
    },
  }),
  { name: 'todo-storage' }))


//分两步写：
// 1. const createTodoStore = create<TodoStore>()  //返回一个待配置的set创建函数
// 2. export const useTodoStore = createTodoStore( //传入store的核心配置（persist包裹的内容），最后创建出store
//   persist((set)=>({}),{}) //若不用中间键 ，直接(set)=>({})
// )
// //Zustand 支持多个中间件链式调用（比如 persist + devtools + immer），柯里化的写法能让中间件的组合更清晰
  

//表单专属的 useFormStore ， 独立创建、独立导出
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

// Zustand全局状态的类型约束
interface FormStore {
  // 1.表单相关核心状态
  formLoading: boolean;//表单提交的loading状态，防止重复点击提交
  formDraft: Partial<FormValues>;//表单草稿：存填写的内容，partrial表示所有字段可选
  formSubmitHistory: FormValues[];//表单提交的历史记录，可选做展示用
  // 2.表单相关方法
  setFormDraft: (draft: Partial<FormValues>) => void;//更新表单草稿
  //Partial是TS内置的标准工具类型，Partial<T> 的唯一作用，接受一个泛型类型T，并将类型里的【所有属性】全部转换为【可选属性】，可选符？，底层逻辑，遍历T的所有属性，并给每个属性加上【可选修饰符？】
  setFormLoading: (loading: boolean) => void;//设置loading状态
  addSubmitHistory: (data: FormValues) => void;//添加提交记录

  //3.TodoList的登录状态（复用，给表单做权限）
  isLogin: boolean,
  setLogin: (status: boolean) => void//写void，表面是为了改状态，不是为了拿一个结果，不需要用到返回值
  //若我调用一个函数，是为了拿到返回值再做后续逻辑，那这里就不能写void
  //isLogin是自义定的，但是是行业通用的【命名规范约定】：所有以 is 开头的变量 / 属性名，都「强制表示：这个变量的类型是布尔值（boolean）」
}

//创建zuzstand仓库+persist持久化（刷新页面，数据不丢失！）
export const useFormStore = create(
  persist<FormStore>(
    (set) =>({
      //初始化状态
      formLoading: false, //未提交
      formDraft: {},
      formSubmitHistory: [],
      isLogin: false, //未登录
      
      //定义方法
      setFormDraft: (draft) => set((state) => ({
        formDraft:{...state.formDraft,...draft}
      })),
      setFormLoading: (loading) => set({ formLoading:loading}),
      addSubmitHistory: (data) => set((state) => ({
        formSubmitHistory: [...state.formSubmitHistory, data]
      })),
      setLogin: (status) => set({ isLogin: status})
      
    }),
    {
      name: "form-storage", //本地储存的唯一key
  
    }
  )
)
//用persist中间件实现【表单草稿持久化】：填一半表单，刷新页面、切到todolist页面再切回来，填写的内容不会消失！
//用formLoading状态：点击提交后按钮至灰，防止用户重复点击提交（企业开发必做）
//统一管理：表单状态+dotolist的登录状态 都在一个仓库，符合单一数据源 理念
//TS强类型约束：所有状态和方法都有类型，写代码有智能提示，不会写错字段