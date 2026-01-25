import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useFormStore } from '../store/todoStore';
import request from '../utils/request';

const { Title } = Typography;

//登录表单值的类型约束
interface LoginFormValues {
  username: string;
  password: string;
}
// 登录接口返回数据类型（适配后端实际返回结构）
interface LoginResponse {
  data?: {
    token?: string;
    code?: number;
    message?: string;
  };
}
const LoginPage: React.FC = () => {
  // 创建表单实例
  const [form] = Form.useForm<LoginFormValues>();
  // 路由跳转实例
  const navigate = useNavigate();
  // 从zustand获取登录状态及相关操作方法
  const isLogin = useFormStore(state => state.isLogin);
  const setLogin = useFormStore(state => state.setLogin);
  const formLoading = useFormStore(state => state.formLoading);
  const setFormLoading = useFormStore(state => state.setFormLoading);

   // 已登录用户访问登录页自动跳转首页
  React.useEffect(() => {
    if (isLogin) {
      navigate('/', { replace: true });
    }
  }, [isLogin, navigate]);

  // 登录提交核心逻辑：请求后端接口，处理登录状态与跳转
  const handleLogin = async (values: LoginFormValues) => {
    try {
      // 开启loading，防止重复提交
      setFormLoading(true);
     
      // 模拟登录接口返回（实际项目替换为真实请求）
      // const res = await request.post<LoginResponse>('/login', values);
        const res = { token: 'mock-token-123456', code: 200, message: '登录成功' };
      console.log('登录成功返回数据：', res);// res就是LoginResponse类型
      
      // 登录成功：更新登录状态、存储token、跳转首页
      message.success('登录成功！');
      setLogin(true);
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      navigate('/', { replace: true });
    } catch (error) {
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
      margin: '80px auto', 
      padding: '0 16px' 
    }}>
      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          用户登录
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
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