import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
//PayloadAction 是 Redux Toolkit 内置的一个 TypeScript 类型，专门用来描述 Redux Action 的结构（尤其是包含 payload 的 Action）

export interface TodoItem {   //为什么要导出TodoItem？？
  id: string;
  title: string; //审批内容（改为content更好？）
  completed: boolean;
  createdAt: Date;   //创建todo的事件
};

interface TodoState{  
  todos: TodoItem[];
  status: 'idle' | 'loading' | 'succeed' | 'failed'; //异步状态
  error: string|null   //异步信息
};

const initialState: TodoState = {
  todos: [], 
  status: 'idle',
  error: null
};
//什么时候单引号，什么时候双引号

//异步加载todos(改为可用的服务器)- 用了redux-persist会自动渲染localstorage里的数据到页面，若手写储存，需要再页面组件里面用useEffect完成次异步
//异步加载Todo列表 - 导出供组件dispatch调用
export const fetchTodo = createAsyncThunk('todos/fetchTodos',   
  async () => {
    //模拟从localStorage里得到数据，从服务系要下载axios.get/post
    const savedTodos = localStorage.getItem('redux-todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos, (key, value) =>
        key === 'createdAt' ? new Date(value) : value 
      );
      return parsedTodos
    }
    return [];
  }
);

const todoSlice = createSlice({
  name: 'todos',
  initialState,  //这就是下面参数state拿到的值的初始值
  reducers: {
    //1.新增代办    
    addTodo: (state, action: PayloadAction<string>) => {
      const todo: TodoItem = {
        id: Date.now().toString(), //取时间戳再转字符串(解析)，唯一标识
        title: action.payload,
        completed: false, //默认是未完成
        createdAt: new Date() //快速获得时间戳
      };
      state.todos.push(todo) //RTK immer库 （状态不可变）
      //因为有immer，所以可以直接用push？？但是zustand就不可以？->是的
      // 保存到localStorage
      // Write mutable code that gets converted to immutable updates
      //关键：RTK 内置了 Immer 库，这里的 state 是 Immer 包装的「代理对象」，允许你用「可变式写法」（如 push/splice/ 直接赋值）修改状态，底层会自动转换为 Redux 要求的「不可变更新」（无需手动写 [...state.todos, todo] 这种繁琐写法）
    },

    //2.切换代办状态（reducer应该只用来'计算新状态'，而不应该'存数据'，持久化的标准做法应该是用Redux中间键redux-persist
    toggleTodo: (state, action: PayloadAction<string>) => {
      //找到切换的代办todo （find遍历，不会改变原数组，内含immer库，所以直接赋值）
      const todo = state.todos.find(item => item.id === action.payload);
      if (todo) {
        //关键：immer库背后对更新后的state.todos新赋值，所以储存的才是最新的状态？？->不是
        todo.completed = !todo.completed;
        //储存到本地（reducer应该是纯函数，这里储存是副作用了，而且存的应该是之前旧的，因为上面的immer是修改该的草稿，只有全部reducer执行完，才会修改真实的数据
        //副作用用组件中的useEffect 或相关中间键来处理！
      }
    },
      
    //3.删除代办(用filter删除！)
    deleteTodo: (state, action: PayloadAction<string>) => {
      //state.todos开始就是immer的草稿了，直接修改，todos会在immer的操作下跟着变化，所以后续保存到本地的是新的todos
      state.todos = state.todos.filter(todo => todo.id !== action.payload);
      //遍历todos，过滤出不等于点击事件的payload并让它们重新生成todos！

    },

    //4.修改指定代办内容（title）
    updateTodo: (state, action: PayloadAction<{ id: string, title: string }>) => {
      const todo = state.todos.find(t => t.id === action.payload.id);
      //先找到修改的todo
      // （=== 左边是所有state.tosdos的id，右边是事件捕捉传入的某个todo的id）
      if (todo) {
        todo.title = action.payload.title;
      }
    },
    //5.清空所有已完成代办(有删除就用filter)
    clearCompleted: (state) => {
      state.todos = state.todos.filter(todo => !todo.completed); 
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodo.fulfilled, (state, action) => {
        state.status = 'succeed';
        state.todos = action.payload;
      })
      .addCase(fetchTodo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || '请求失败'; //加null兜底
      });
    
    //RTK给异步的不同action包含的字段有自己的设置：
    // pending的action只有type
    // fulfiled的action有type和payload
    // rejected的action有type和error，里面包含message错误信息 name错误类型 stack错误栈等字段
  },

});

export const { addTodo, deleteTodo, toggleTodo, updateTodo, clearCompleted } = todoSlice.actions;
export default todoSlice.reducer; 

