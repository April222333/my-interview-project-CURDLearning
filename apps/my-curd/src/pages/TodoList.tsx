import React, { useState } from "react";
import { List, Input, Button, Checkbox, Space, Typography, Radio, Card, message } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
// RTK相关导入
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addTodo, deleteTodo, updateTodo, clearCompleted, toggleTodo, fetchTodo } from '../store/todoSlice'
// Zustand相关导入
import { useTodoStore } from '../store/todoStore'
// 导入TodoItem类型完成TS约束
import type { TodoItem } from '../store/todoSlice';

const { Title, Text } = Typography
const { Search } = Input

type StateManagementType = 'zustand'|'redux'

const TodoList: React.FC = () => {
  // 状态管理方案切换
  const [stateManagement, setStateManagement] = useState<StateManagementType>('zustand')
  // 组件局部状态
  const [newTodo, setNewTodo] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  // 获取状态管理相关数据和方法
  // Zustand状态
  const zustandStore = useTodoStore()
  // Redux状态
  const reduxTodos = useAppSelector((state) => state.todos.todos) 
  const dispatch = useAppDispatch()

  // 根据选择的状态管理方案统一数据和方法接口
  const getStore = () => {
    switch (stateManagement) {
      case 'zustand':
        return zustandStore;
      case 'redux':
        return {
          todos: reduxTodos,
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

  // 添加新任务
  const handleAddTodo = () => {
    if (newTodo.trim()){
      addTodoMethod(newTodo)
      setNewTodo('')
      message.success('任务添加成功')
    } else {
      message.error('任务内容不能为空')
    }
  }

  // 触发任务编辑
  const handleEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditingText(todo.title)
  }

  // 保存编辑后的任务
  const handleSaveEdit = () => {
    if (editingText.trim() && editingId) {
      updateTodoMethod(editingId, editingText)
      setEditingId(null);
      setEditingText('')
      message.success('任务更新成功')
    } else {
      message.error('任务内容不能为空')
    }
  };

  // 取消任务编辑
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('')
  };

  // 计算已完成任务数量
  const completedCount = todos.filter(todo=> todo.completed).length

  return (
    <div>
      <Title>Todo List APP</Title>
      <Card>
        <Space>
          {/* 状态管理方案切换 */}
          <Radio.Group
              value={stateManagement}
              onChange={(e) => setStateManagement(e.target.value)}
              buttonStyle="solid">
            <Radio.Button value='zustand'>Zustand</Radio.Button>
            <Radio.Button value='redux'>Redux Toolkit</Radio.Button>
          </Radio.Group>

         <Space>
            {/* 新增任务输入框 */}
            <Search
              placeholder="输入新审批"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onSearch={handleAddTodo}
              enterButton={<PlusOutlined/>}
            />
         </Space>
         <Space>
            <Text> 
              已完成{completedCount}/总计{todos.length}
            </Text>
            {/* 清除已完成任务按钮 */}
            <Button 
              danger
              onClick={() =>clearCompletedMethod()}
              disabled={completedCount === 0}> 
              清除所有完成审批
            </Button>
         </Space>
       </Space>
      </Card>
      
      {/* 任务列表展示 */}
      <List
       itemLayout="horizontal"
        dataSource={todos}
        renderItem={(todo) => (
          <List.Item
            actions={[
              <Button
                key='edit'
                icon={<EditOutlined />}
                onClick={() => handleEdit(todo)}
                disabled={editingId !== null}
              />,
              <Button
                key='delete'
                danger
                icon={< DeleteOutlined/>}
                onClick={()=> deleteTodoMethod(todo.id)}
              />
            ]}>
            
            <List.Item.Meta 
              avatar={
                <Checkbox
                  checked={todo.completed}
                  onChange={() => toggleTodoMethod(todo.id)}
                />
               }
              title={
                editingId === todo.id ? (
                  <Space>
                    <Input
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
                ) : (
                  <span>
                    {todo.title}
                  </span>
                )}
              description={
               <Text>
                创建于：{new Date(todo.createdAt).toLocaleDateString()}
               </Text>
               }
              /> 
            </List.Item>
        )}
        locale={{
         emptyText:<Text>暂无任务，开始添加吧！</Text>
        }}
      /> 
    </div>
  )
}

export default TodoList;