//区别
// 1. 创建仓库 createSlice+configureStore vs. create
// 2. 状态更新 定义reducer+通过dispatch出发 vs. 直接调用set函数
// 3. 持久化   集成redux-persist（需配置PersistGate） vs. persist中间件一键包裹
// 4. 组件中的使用 useSelector+useDispatch vs. 直接调用 create导出的HOOK
// 5. 上下文依赖  必须用Provider包裹根组件 vs. 无需Privoder，开箱即用

//异步区别：
//
//
//
//
//

import React, { useState } from 'react';
import { List, Input, Button, Checkbox, Space, Typography, Card, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
// 只保留 Zustand 的导入
import { useTodoStore } from '../store/todoStore';

const { Title, Text } = Typography;
const { Search } = Input;

const TodoListZustand: React.FC = () => {
  // 仅保留业务相关的 state，移除状态管理切换的 state
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // 直接从 Zustand Store 中解构出状态和方法（核心）
  const { 
    todos, 
    addTodo, 
    toggleTodo, 
    deleteTodo, 
    updateTodo, 
    clearCompleted 
  } = useTodoStore();

  // 添加 Todo 逻辑
  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo); // 直接调用 Zustand 的 addTodo 方法
      setNewTodo('');
      message.success('任务添加成功');
    } else {
      message.error('任务内容不能为空');
    }
  };

  // 编辑 Todo 逻辑
  const handleEdit = (todo: any) => {
    setEditingId(todo.id);
    setEditingText(todo.title);
  };

  // 保存编辑逻辑
  const handleSaveEdit = () => {
    if (editingText.trim() && editingId) {
      updateTodo(editingId, editingText); // 直接调用 Zustand 的 updateTodo 方法
      setEditingId(null);
      setEditingText('');
      message.success('任务更新成功');
    } else {
      message.error('任务内容不能为空');
    }
  };

  // 取消编辑逻辑
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // 计算已完成数量
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <Title level={2}>Todo List (Zustand 版本)</Title>
      <Card style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 移除状态管理切换的 Radio 组 */}
          <Space style={{ width: '100%' }}>
            <Search
              placeholder="输入新任务"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onSearch={handleAddTodo}
              enterButton
              style={{ flex: 1 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddTodo}
            >
              添加
            </Button>
          </Space>

          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Text type="secondary">
              已完成 {completedCount} / 总计 {todos.length}
            </Text>
            <Button 
              danger 
              onClick={clearCompleted} // 直接调用 Zustand 的 clearCompleted 方法
              disabled={completedCount === 0}
            >
              清除已完成
            </Button>
          </Space>
        </Space>
      </Card>

      <List
        itemLayout="horizontal"
        dataSource={todos}
        renderItem={(todo) => (
          <List.Item
            actions={[
              <Button
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEdit(todo)}
                disabled={editingId !== null}
              />,
              <Button
                key="delete"
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteTodo(todo.id)} // 直接调用 Zustand 的 deleteTodo 方法
              />,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Checkbox 
                  checked={todo.completed} 
                  onChange={() => toggleTodo(todo.id)} // 直接调用 Zustand 的 toggleTodo 方法
                />
              }
              title={
                editingId === todo.id ? (
                  <Space>
                    <Input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onPressEnter={handleSaveEdit}
                      autoFocus
                    />
                    <Button type="primary" size="small" onClick={handleSaveEdit}>
                      保存
                    </Button>
                    <Button size="small" onClick={handleCancelEdit}>
                      取消
                    </Button>
                  </Space>
                ) : (
                  <span 
                    style={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      opacity: todo.completed ? 0.6 : 1,
                    }}
                  >
                    {todo.title}
                  </span>
                )
              }
              description={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  创建于: {new Date(todo.createdAt).toLocaleString()}
                </Text>
              }
            />
          </List.Item>
        )}
        locale={{
          emptyText: <Text type="secondary">暂无任务，开始添加吧！</Text>,
        }}
      />
    </div>
  );
};

export default TodoListZustand;