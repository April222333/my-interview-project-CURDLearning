import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
// 导入你的zustand状态（控制登录状态）
import { useFormStore } from '../store/todoStore';
// 导入你封装的axios实例
import request from '../utils/request';

const { Title } = Typography;

// 登录表单值的TS类型约束
interface LoginFormValues {
  username: string;
  password: string;
}
//登录接口后端返回的data类型（根据后端实际返回结构调整）
interface LoginResponse {
  data?: {
    token?: string;// 后端返回的token
    code?: number;// 可选：后端状态码
    message?: string;// 可选：后端提示信息
  };
}
const LoginPage: React.FC = () => {
  // 创建表单实例
  const [form] = Form.useForm<LoginFormValues>();
  // 路由跳转方法
  const navigate = useNavigate();
  // 从zustand取登录状态和loading控制方法
  const isLogin = useFormStore(state => state.isLogin);
  const setLogin = useFormStore(state => state.setLogin);
  const formLoading = useFormStore(state => state.formLoading);
  const setFormLoading = useFormStore(state => state.setFormLoading);

  // 已登录用户访问登录页，自动跳转到首页
  React.useEffect(() => {
    if (isLogin) {
      navigate('/', { replace: true });
    }
  }, [isLogin, navigate]);
  //<Navigate> 组件的 replace 是一个布尔值属性（默认 false），作用是：控制路由跳转时，如何修改浏览器的历史记录栈。

  // 登录提交核心逻辑
  const handleLogin = async (values: LoginFormValues) => {
    try {
      // 开启loading，防止重复提交
      setFormLoading(true);
      // 调用你封装的axios，请求后端登录接口
     
      //真实请求 const res = await request.post<LoginResponse>('/login', values);
      //模拟后端返回结构
        const res = { token: 'mock-token-123456', code: 200, message: '登录成功' };
      console.log('登录成功返回数据：', res);// res就是LoginResponse类型
      
      // 登录成功：1. 更新zustand的登录状态 2. 存储token（如果后端返回） 3. 跳转首页
      message.success('登录成功！');
      setLogin(true);
      // 假设后端返回token，存储到localStorage（和你axios封装的token逻辑对应）
      //TS能识别res.token，无报错（路径正确+类型约束）
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      // 跳转到首页
      navigate('/', { replace: true });
    } catch (error) {
      // 登录失败：提示错误
      message.error('登录失败！账号或密码错误');
      console.error('登录请求异常：', error);
    } finally {
      // 无论成败，关闭loading
      setFormLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 400, 
      margin: '80px auto', // 页面垂直居中
      padding: '0 16px' // 适配移动端
    }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          用户登录
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          // 初始值（方便测试，可删除）
          initialValues={{ username: 'admin', password: '123456' }}
        >
          {/* 账号输入框 */}
          <Form.Item
            name="username"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入账号"
              autoComplete="off"
            />
          </Form.Item>

          {/* 密码输入框 */}
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度不能少于6位' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="off"
            />
          </Form.Item>

          {/* 登录按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
              block // 按钮占满宽度
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;