import React from 'react' //拿里面的useEffect
import { Form, Input, Select, DatePicker, Checkbox, Radio, Button, InputNumber, message, Card, Space, Typography, Divider } from 'antd'
//没有space，是因为antd表单的Form父必须对应直接子项Form Item，才能控制管理每个子项，若子项写在Space里面就不是‘直接’关系Form无法控制，所以只能单独写样式margin
//DatePicker底层依赖dayjs库
import dayjs from 'dayjs'
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
//引入zustand和axios 
import { useFormStore } from '../store/todoStore'
import request from '../utils/request'//aixos封装

const { Title, Paragraph } = Typography
const { Option } = Select 
const { RangePicker } = DatePicker
const { TextArea } = Input

interface FormValues {
  username: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  education: string;
  skills: string[];
  startDate: [dayjs.Dayjs, dayjs.Dayjs];
  //元组Tuple 是 【定长，定类型】的数组
  //而 antd 的RangePicker返回对象也是[dayjs.Dayjs, dayjs.Dayjs]
  //dayjs提供的 封装后的日期实例对象
  bio: string;
  agreement: boolean
}
//antd Form 组件内部，所有需要「收集值 / 做校验 / 触发提交」的 <Form.Item name="xxx"> 必须是 <Form> 的直接子节点 **！不能被 <Space> / <div> / <Row> 等任何组件嵌套包裹！
const FormPage: React.FC = () => {
  const [form] = Form.useForm<FormValues>()
  //Form.useForm()这个hooks执行后，会返回一个长度固定为1的数组，里面是有一个元素，就是表单实例对象，我们解构出来并命名为form，若不用解构需要用两行代码：
  // cosnt arr = Form.useForm<FormValues>() -拿到整个数组(目的是拿到数组里的某个元素)
  // const form = arr[0] 对应的元素才是实例对象
  //这个form上挂载了大量的方法，都是antd封装好的开箱即用
  //已经多了<FormValues> TS类型约束，写代码时有智能提示

  //从zustand取状态和方法
const formDraft = useFormStore(state=>state.formDraft)
const formLoading = useFormStore(state=>state.formLoading)
const setFormDraft = useFormStore(state=>state.setFormDraft)
const setFormLoading = useFormStore(state=>state.setFormLoading)
const addSubmitHistory = useFormStore(state=>state.addSubmitHistory)
  //新增 组件挂载时，把草稿回显到表单
  React.useEffect(() => {
    if (Object.keys(formDraft).length > 0) {
      form.setFieldsValue(formDraft) //对象formDraft的key要对应form的name，value
      //区别form.setFieldValue
    }
  }, [formDraft, form]) //依赖项数组
  //组件挂载时执行一次，依赖项变化时重新执行：表单组件第一次挂载到页面上，这个回调会自动执行一次，草稿数据和表单实例任意一个发生变化时，这个回调函数会重新执行一次
  
  
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
    //自定义校验规则要遵循规则的函数模式：
   //参数格式固定：2个形参，顺序固定，缺一不可
   //必须返回的是一个promise函数
  const validUsername = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入用户名'));
    }
    if (value.length < 3) {
      return Promise.reject(new Error('用户名长度至少位3个字符'));
    }
    return Promise.resolve();
  }  

  //核心改造：表单提交函数 onFinish (异步+axios请求+zustand状态)
  //重点：改成 async/await 异步函数，因为axios请求是异步的
  //async/await+try/catch」是处理异步请求的标准写法；
  const onFinish = async (values: FormValues) => {
    try {
      //1.提交前：开启loading，按钮置灰，防止重复提交
      setFormLoading(true)
      console.log('表单提交数据', values)

      //2.核心：调用封装的axios，提交表单数据到后端接口
      //这里用post请求，接口地址模拟
      const res = await request.post('/users', values)
      console.log('接口返回结果', res);

      //3.请求成功：提示+存提交记录+重置表单+清空草稿
      message.success('表单提交成功，接口请求成功！')
      addSubmitHistory(values)//把提交的数据存到zusatand的历史记录里
      form.resetFields()//重置表单
      setFormDraft({})//清空草稿
    } catch (error) {
      message.error('表单提交失败，接口请求异常！')
    } finally {
      //5.无论成功失败:关闭loading，按钮恢复可用
      setFormLoading(false)
    }
    // console.log('表单数据', values);
    // message.success('表单提交成功');
    // form.resetFields();
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('表单错误：', errorInfo);
    message.error('表单提交失败，请检查错误信息');
  }
  //Antd Form 组件的 Form.useForm() 来管理表单,表单的所有数据（用户名、手机号、学历、技能等），都存放在 React 【组件的「局部状态」】 中（是 Antd Form 封装的内部 state，本质和 useState 存的数据一样）
  //这些数据 完全没有进入 Redux 的 Store，只是「组件自己的私有数据」
  //redux-persist 只监听 Redux Store 仓库 里的状态变化，只持久化「Store 里的数据」，对组件局部状态（useState/useForm）、组件外部变量，一概不管！
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
            //新增 实时保存表单草稿！！
            //表单每输入一次，就自动存zustand，刷新不丢
          onValuesChange={(changedValues) => setFormDraft(changedValues)}
          //changedValues参数本质：本次发生变化的表单字段的【键值对对象】
          //键key，就是表单项的name属性，对应值value，antd做了封装所以不用从e.target.value开始
          //特点：只存本次变化的字段，不是整个表单的所有值,性能最优，而且逻辑简洁到极致
          //onValueChange第二个参数allValues，表单所有字段的最新完整值
        >

          {/* antd 6.1.1 分割线方向+文字对齐属性 */}
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
              valuePropName='checked'//告诉Form.Item，放弃默认的value绑定，而是绑定到子组件的checked属性
              //普通输入框<input>的状态是有value决定的
              //复选框<checkbox>单选框<radio>状态由原生的checked控制，

              //下面规则的value就是valuePropName对应的值
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
                {/*关键： htmlType="submit"  点击会触发表单的校验和提交流程*/}
            {/* 触发 Antd Form 的「校验 → 提交」完整流程 → 校验通过就执行 onFinish，校验失败就执行 onFinishFailed */}
            {/* 给按钮加loading状态，为true表示我正在提交，按钮禁止变灰，防止重复提交，antd封装的组件，antd大多数 */}
                <Button type='primary' htmlType='submit' loading={formLoading}>
                  提交表单
                </Button>
            <Button onClick={() => {
              form.resetFields()
              setFormDraft({})//重置时清空草稿
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


//useEffect高频使用场景：
//1 组件挂载时，执行一次（初始化，获取dom元素
//2 监听变量变化，自动执行（form
//3 组件卸载时，执行清理操作：在 useEffect 的回调函数里，return 一个函数，这个返回的函数就是「清理函数」，会在 组件被卸载（从页面消失）时自动执行
//React 函数组件中，专门处理「副作用」的钩子。
//组件的主逻辑是：根据state prop渲染页面UI(纯展示，无其它影响)
//一切不属于「纯 UI 渲染」的操作，都是副作用 → 这些操作全部都要放在 useEffect 里执行！