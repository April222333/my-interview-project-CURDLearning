import React, { useState } from "react";
import { List, Input, Button, Checkbox, Space, Typography, Radio, Card, message } from 'antd'
//Radio：单选按钮框:提供「互斥的选项选择」功能
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
//只有RTK部分
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addTodo, deleteTodo, updateTodo, clearCompleted, toggleTodo, fetchTodo, } from '../store/todoSlice'
//zustand部分
import { useTodoStore } from '../store/todoStore'
// 统一导入TodoItem类型，补全TS约束
import type { TodoItem } from '../store/todoSlice';

//而用在组件用异步dispatch需要用useffect

const { Title, Text } = Typography //antd库-文本排版组件集合
//里面有title txet paragraph ..组件
const { Search } = Input //antd库-输入框组件集合

type StateManagementType = 'zustand'|'redux'
const TodoList: React.FC = () => {
  

const [stateManagement, setStateManagement] = useState<StateManagementType>('zustand')
//1 拿到此页面的局部状态  
  const [newTodo, setNewTodo] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

//2 获取数据和方法
   //zustand状态
  const zustandStore = useTodoStore()
   //redux状态
  const reduxTodos = useAppSelector((state) => state.todos.todos) 
  // const reduxStatus = useAppSelector((state) => state.todos.status)
  // const reduxError = useAppSelector((state)=>state.todos.error)
  const dispatch = useAppDispatch()
//React 对 Hook 的调用有严格规则，目的是保证 Hook 的调用顺序稳定（React 靠调用顺序追踪每个 Hook 的状态,不能在普通函数，条件语句，循环，嵌套里面中调用hook，只能在顶层或自定义hook里面用hook，且自定义hoook必须以use开头
  //根据选择的状态管理方案获取数据和方法（统一接口）
  const getStore = () => {
    switch (stateManagement) {
      case 'zustand':
        return zustandStore;
      case 'redux':
        return {
          todos: reduxTodos,
          // status:reduxStatus ,
          // error: reduxError, 
          addTodo: (title: string) => dispatch(addTodo(title)),
          toggleTodo: (id: string) => dispatch(toggleTodo(id)),
          deleteTodo: (id: string) => dispatch(deleteTodo(id)),
          updateTodo: (id: string, title: string) => dispatch(updateTodo({ id, title })),
          clearCompleted: () => dispatch(clearCompleted()),
          fetchTodo: () => dispatch(fetchTodo())
        };
      default:
        return zustandStore;
    }
  }
  
  const { todos, addTodo: addTodoMethod, toggleTodo: toggleTodoMethod, deleteTodo: deleteTodoMethod, updateTodo: updateTodoMethod, clearCompleted: clearCompletedMethod } = getStore()
  
//初始化自动读取本地数据，RTK zustand的persist已经自动完成这些了，写异步的目的是对接真实的后端接口（表单页面有例子）
// React.useEffect(() => {
//   getStore().fetchTodo();
// }, [stateManagement]); 

//3 添加事件方法
  const handleAddTodo = () => {
    if (newTodo.trim()){  //客户输入数据newTodo传入到这里 .trim()去除字符串收尾空白字符
      addTodoMethod(newTodo)
      setNewTodo('') //清空状态，等待接受下次信息，且UI显示也是''
      message.success('任务添加成功') //antd库
    } else {
      message.error('任务内容不能为空')
    }
  }

   //更改局部状态数据->点击编辑按钮触发->保存对应局部状态的id和内容
  const handleEdit = (todo: TodoItem) => {
    setEditingId(todo.id); //拿到用户输入的todo里面的id和内容->更改局部状态
    setEditingText(todo.title)
  }

  //更改后的局部数据保存到store里并重置局部状态
  const handleSaveEdit = () => { //拿到更改后的局部状态数据并保存到store里
    if (editingText.trim() && editingId) {
      updateTodoMethod( editingId,editingText ) //更改store内容
      setEditingId(null); //重置局部状态->对应三元判断
      setEditingText('') //重置局部状态
      message.success('任务更新成功')
    } else {
      message.error('任务内容不能为空')
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('') //组件局部状态清空
  };

  const completedCount = todos.filter(todo=> todo.completed).length //completed为true的会被筛选出来重新组成新todos数组，然后取其长度

//必须下载 npm install @types/react @types/react-dom --save-dev
  return (
    <div>
      {/* Typograpy排版组件 子组件Title Text */}
      <Title>Todo List APP</Title>
      <Card>
        <Space>

          <Radio.Group
              value={stateManagement}
              onChange={(e) => setStateManagement(e.target.value)}
              buttonStyle="solid">
            <Radio.Button value='zustand'>Zustand</Radio.Button>
            <Radio.Button value='redux'>Redux Toolkit</Radio.Button>
          </Radio.Group>

         <Space>
          {/* 间距组件 */}
            <Search //antd库 input组件集合里的search组件，封装了输入框+搜索按钮+支持回车enterButton
              placeholder="输入新审批" //输入框显示
              // 双向绑定：
              value={newTodo} //2.数据显示到UI：输入框显示的内容
              onChange={(e) => setNewTodo(e.target.value)} //1.拿到并更新组件局部状态（实时更新）
              onSearch={handleAddTodo}  //按回车/按钮时触发 发送dispatch addTodo，数据传到sotre
              enterButton={<PlusOutlined/>} //从放大镜改成了+添加
              //给 Search 组件加 “回车 / 搜索” 按钮，敲回车/内置按钮会触发onSearch
              // onSearch + enterButton ->enter+内置按钮 ，无序额外手动
            />
            {/* <Button 
            onClick={handleAddTodo}  //手动添加的按钮
            >添加</Button> */}
         </Space>
         <Space>
            <Text> 
              已完成{completedCount}/总计{todos.length}
            </Text>
            <Button 
              // antd 里面Button的danger和disabled属性：控制视觉样式和交互行为

              danger //通常为boolean，将按钮标记为危险操作并+视觉表现
              onClick={() =>clearCompletedMethod()}
              disabled={completedCount === 0}> 
              {/* 通常boolean，禁用按钮，使其不可点击+视觉 */}
              清除所有完成审批
            </Button>
         </Space>
       </Space>
      </Card>
      
      <List  //antd列表组件
       itemLayout="horizontal" //子项布局样式
        dataSource={todos}     //原材料->必须是数组
        renderItem={(todo) => ( //加工图纸 渲染函数 List会遍历dataSource数组，对每项todo都会调用这个renderItem函数，需返回一个React元素 <list.Item/>
          //  <List.Item>: 单个列表项的容器 也是renderItem函数返回的组件，代表列表中的每一行
          <List.Item  //标准化列表项
            //actions={[...]} 在列表项右侧显示一组操作按钮->编辑&删除按钮
            //actions数组里的每个元素最好加上唯一key
            actions={[
              <Button
                key='edit'
                icon={<EditOutlined />}
                onClick={() => handleEdit(todo)}
                disabled={editingId !== null}  //当id为空，不可使用此按钮
              />,
              <Button
                key='delete'
                danger
                icon={< DeleteOutlined/>}
                //直接调用dispatch
                onClick={()=> deleteTodoMethod(todo.id)}
              />
            ]}
            // List.Item的开始标签尾标 > 
            >
            
         {/* 列表项内容的结构化布局<List.Item>的一个子组件：范列表项内容的布局
           预设了“头像avatar-标题-描述”的经典布局 */}
            <List.Item.Meta 
              
              avatar={   // 1. avatar={} 设置列表项最左侧的头像或图标
                <Checkbox //勾选框
                  checked={todo.completed} //勾选内容->理应为布尔值
                  //直接调用dispatch
                  onChange={() => toggleTodoMethod(todo.id)}
                />
               }
              title={ // 2. title={} 列表项的主标题->整个组件的核心交互逻辑
                editingId === todo.id ? ( //三元判断—是否点击了编辑按钮？
                  <Space>
                    <Input
                      //双向绑定
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                    <Button onClick={handleSaveEdit}>
                      保存
                    </Button>
                    <Button onClick={handleCancelEdit}>
                      取消
                    </Button>
                  </Space>
                ) : ( //关键：条件渲染！
                  <span >
                    {/* 内容展示 */}
                    {todo.title}
                  </span>
                    
                )}
              description={ // 3.列表项的描述文字
               <Text>
                创建于：{new Date(todo.createdAt).toLocaleDateString()}
               </Text>
               }
              // List.Item.Meta的结束标签
              /> 
            </List.Item>
        )}
        locale={{ //作用于国际化配置，dataSource数组为空时，列表区域显示的提示文本
         emptyText:<Text>暂无任务，开始添加吧！</Text>
        }}
      // <List 尾签 />
      /> 

    </div>
  )
}

export default TodoList;