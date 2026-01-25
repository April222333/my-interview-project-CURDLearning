import React from 'react' 
import { Form, Input, Select, DatePicker, Checkbox, Radio, Button, InputNumber, message, Card,  Typography, Divider } from 'antd'
import dayjs from 'dayjs'
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
//引入zustand和axios 
import { useFormStore } from '../store/todoStore'
import request from '../utils/request'//aixos封装

const { Title, Paragraph } = Typography
const { Option } = Select 
const { RangePicker } = DatePicker
const { TextArea } = Input

// 定义表单提交值的类型约束
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

const FormPage: React.FC = () => {
  const [form] = Form.useForm<FormValues>()

// 从zustand获取表单草稿、加载状态及相关操作方法
const formDraft = useFormStore(state=>state.formDraft)
const formLoading = useFormStore(state=>state.formLoading)
const setFormDraft = useFormStore(state=>state.setFormDraft)
const setFormLoading = useFormStore(state=>state.setFormLoading)
const addSubmitHistory = useFormStore(state => state.addSubmitHistory)
  
// 组件挂载/草稿数据变化时，将草稿回显到表单
  React.useEffect(() => {
    if (Object.keys(formDraft).length > 0) {
      form.setFieldsValue(formDraft) 
    }
  }, [formDraft, form])
  
  // 手机号自定义校验规则
  const validPhone = (_: any, value: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!value) {
      return Promise.reject(new Error('请输入手机号'));
    }
    if (!phoneRegex.test(value)) {
      return Promise.reject(new Error('请输入正确的11位手机号'));
    }
    return Promise.resolve();
  }
   // 用户名自定义校验规则
  const validUsername = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入用户名'));
    }
    if (value.length < 3) {
      return Promise.reject(new Error('用户名长度至少位3个字符'));
    }
    return Promise.resolve();
  }  

  // 表单提交核心逻辑：异步提交数据到后端，处理加载状态和提交结果
  const onFinish = async (values: FormValues) => {
    try {
      setFormLoading(true)
      console.log('表单提交数据', values)

      // 调用封装的axios请求提交表单数据
      const res = await request.post('/users', values)
      console.log('接口返回结果', res);

      // 提交成功：提示用户、保存提交记录、重置表单并清空草稿
      message.success('表单提交成功，接口请求成功！')
      addSubmitHistory(values)
      form.resetFields()
      setFormDraft({})
    } catch (error) {
      message.error('表单提交失败，接口请求异常！')
    } finally {
      setFormLoading(false)
    }

  }

 // 表单提交失败处理逻辑
  const onFinishFailed = (errorInfo: any) => {
    console.log('表单错误：', errorInfo);
    message.error('表单提交失败，请检查错误信息');
  }
  
  return (
    <div>
      <Title>用户信息表单</Title>
      <Paragraph>请填写完整的个人信息，带*为必填项</Paragraph>

      <Card>
        <Form
          form={form}
          layout='vertical'
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            gender: 'male',
            age: 20,
            education: 'bachelor',
            skills: [],
            agreement: false,
          }}
            // 实时保存表单草稿，防止刷新丢失
          onValuesChange={(changedValues) => setFormDraft(changedValues)}
         
        >

          <Divider orientation='horizontal' titlePlacement='left' plain>基本信息</Divider>
          
          
            <Form.Item
              name='username'
              label='用户名'
              rules={[{ validator: validUsername }]}
              style={{marginBottom:16}}>
              
              <Input prefix={< UserOutlined/> } placeholder='请输入用户名'/>
            </Form.Item>
            
            <Form.Item
              name='email'
              label='邮箱'
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message:'请输入正确的邮箱格式'}
                ]}
              style={{marginBottom:16}}>
              
              <Input prefix={ <MailOutlined/> } placeholder='请输入邮箱'/>
            </Form.Item>
            
            <Form.Item
              name='phone'
              label='手机号码'
              rules={[{ validator: validPhone }]}
              style={{marginBottom:16}}>
              
              <Input prefix={<PhoneOutlined/> } placeholder='请输入手机号' />
              </Form.Item>

            <Form.Item
              name='gender'
              label='性别'
              rules={[{ required: true, message: '请选择性别' }]}
              style={{marginBottom:16}}>
              
              <Radio.Group>
                 <Radio value='male'>男</Radio>
                 <Radio value='female'>女</Radio>
                 <Radio value='other'>其他</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              name='age'
              label='年龄'
              rules={[
                { required: true, message: '请输入年龄' },
                { type:'number', min:18, max:120,message:'年龄必须在18-120之间'}
               ]}
              style={{marginBottom:16}}>
                  
              <InputNumber min={1} max={120} />
              </Form.Item>
       

          <Divider titlePlacement='left' plain>教育与技能</Divider>
          <Form.Item
            name='education'
            label='最高学历'
            rules={[{ required: true, message: '请选择学历' }]}
            style={{marginBottom:16}}>
            
              <Select placeholder='请选择最高学历'>
                <Option value='highshool'>高中</Option>
                <Option value='associate'>专科</Option>
                <Option value='bachelor'>本科</Option>
                <Option value='master'>硕士</Option>
                <Option value='doctor'>博士</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name='skills'
              label='技能'
              rules={[{ required: true, message: '请至少选择一项技能' }]}
              style={{marginBottom:16}}>
              <Select mode='multiple' placeholder='请选择技能'>
                 <Option value='javascript'>Javascript</Option>
                 <Option value='typescript'>Typescript</Option>
                 <Option value='react'>React</Option>
                 <Option value='vue'>Vue</Option>
                 <Option value='node'>Node.js</Option>
                 <Option value='python'>Python</Option>
              </Select>  
            </Form.Item>
          
            <Form.Item
              name='startDate'
              label='预计工作日期'
              rules={[{ required: true, message: '请选择日期范围' }]}
              style={{marginBottom:16}}>
              < RangePicker placeholder={['开始日期','结束日期']}/>
              </Form.Item>

            <Form.Item
              name='bio'
              label='个人简介'
              rules={[{ required: true, message: '请输入个人简介' },
                      { min:10, message:'个人简介至少10个字符'}
              ]}
              style={{marginBottom:16}}>
              <TextArea
                rows={4}
                placeholder='请输入个人简介'/>
            </Form.Item>

            <Form.Item
              name='agreement'
              valuePropName='checked'
              rules={[{
                validator: (_: any, value) => {
                  return value? Promise.resolve():Promise.reject(new Error('必须同意用户协议'))
                  }
              }]}
              style={{marginBottom:16}}>
              <Checkbox>
              我已阅读并同意
              <a href='#'>用户协议</a>和<a href='#'>隐私政策</a>
              </Checkbox>  
            </Form.Item>

          <Form.Item>
            {/* 提交按钮：绑定加载状态防止重复提交 */}
                <Button type='primary' htmlType='submit' loading={formLoading}>
                  提交表单
            </Button>
            {/* 重置按钮：清空表单及草稿 */}
            <Button onClick={() => {
              form.resetFields()
              setFormDraft({})
            }}>
                  重置
                </Button>
            </Form.Item>
        
        </Form>
      </Card>
   </div>
 )
}

export default FormPage
