import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// 定义待办项类型
export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
};

// 定义待办状态管理模型
interface TodoState {
  todos: TodoItem[];
  status: 'idle' | 'loading' | 'succeed' | 'failed';
  error: string | null;
};

// 初始状态
const initialState: TodoState = {
  todos: [],
  status: 'idle',
  error: null
};

// 异步加载待办列表（模拟从localStorage读取，实际项目替换为接口请求）
export const fetchTodo = createAsyncThunk('todos/fetchTodos',
  async () => {
    const savedTodos = localStorage.getItem('redux-todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos, (key, value) =>
        key === 'createdAt' ? new Date(value) : value
      );
      return parsedTodos;
    }
    return [];
  }
);

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // 新增待办项
    addTodo: (state, action: PayloadAction<string>) => {
      const todo: TodoItem = {
        id: Date.now().toString(),
        title: action.payload,
        completed: false,
        createdAt: new Date()
      };
      state.todos.push(todo);
    },

    // 切换待办项完成状态
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.todos.find(item => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    // 删除指定待办项
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.todos = state.todos.filter(todo => todo.id !== action.payload);
    },

    // 更新待办项内容
    updateTodo: (state, action: PayloadAction<{ id: string, title: string }>) => {
      const todo = state.todos.find(t => t.id === action.payload.id);
      if (todo) {
        todo.title = action.payload.title;
      }
    },

    // 清空所有已完成待办项
    clearCompleted: (state) => {
      state.todos = state.todos.filter(todo => !todo.completed);
    },
  },

  // 处理异步action的状态更新
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
        state.error = action.error.message || '请求失败';
      });
  },
});

export const { addTodo, deleteTodo, toggleTodo, updateTodo, clearCompleted } = todoSlice.actions;
export default todoSlice.reducer;