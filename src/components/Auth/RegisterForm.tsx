// src/components/Auth/RegisterForm.tsx
import { useState } from 'react';
import { Form, Input, Button, Alert, Progress, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useRegister, usePasswordStrength } from '@/hooks/useAuth';
import type { RegisterRequest } from '@/types/auth';

const { Text } = Typography;

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export default function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [form] = Form.useForm();
  const { mutate: register, isPending } = useRegister();
  const { checkStrength } = usePasswordStrength();
  
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    if (password) {
      const strength = checkStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  };

  const handleSubmit = async (values: RegisterRequest) => {
    setRegisterError(null);

    register(values, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (err: any) => {
        setRegisterError(
          err.response?.data?.detail || err.message || '注册失败，请稍后重试'
        );
      },
    });
  };

  // 密码强度进度条配置
  const getPasswordStrengthConfig = () => {
    if (!passwordStrength) return { percent: 0, status: undefined, color: undefined };

    const configs = {
      weak: { percent: 33, status: 'exception' as const, color: '#ff4d4f' },
      medium: { percent: 66, status: 'normal' as const, color: '#faad14' },
      strong: { percent: 100, status: 'success' as const, color: '#52c41a' },
    };

    return configs[passwordStrength.level];
  };

  const strengthConfig = getPasswordStrengthConfig();

  return (
    <div className="register-form-container">
      <Form
        form={form}
        name="register"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
        layout="vertical"
      >
        {/* 错误提示 */}
        {registerError && (
          <Form.Item>
            <Alert
              message="注册失败"
              description={registerError}
              type="error"
              showIcon
              closable
              onClose={() => setRegisterError(null)}
            />
          </Form.Item>
        )}

        {/* 用户名 */}
        <Form.Item
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, message: '用户名至少 3 个字符' },
            { max: 50, message: '用户名最多 50 个字符' },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: '用户名只能包含字母、数字和下划线',
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="用户名"
            autoComplete="username"
            allowClear
          />
        </Form.Item>

        {/* 邮箱 */}
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="邮箱"
            autoComplete="email"
            allowClear
          />
        </Form.Item>

        {/* 姓名（可选） */}
        <Form.Item
          name="full_name"
          rules={[{ max: 100, message: '姓名最多 100 个字符' }]}
        >
          <Input
            prefix={<SafetyOutlined className="text-gray-400" />}
            placeholder="姓名（可选）"
            autoComplete="name"
            allowClear
          />
        </Form.Item>

        {/* 密码 */}
        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码至少 8 个字符' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="密码"
            autoComplete="new-password"
            onChange={handlePasswordChange}
          />
        </Form.Item>

        {/* 密码强度指示器 */}
        {passwordStrength && (
          <Form.Item>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Text type="secondary" className="text-sm">
                  密码强度:
                </Text>
                <Text
                  style={{
                    color: strengthConfig.color,
                    fontWeight: 'bold',
                  }}
                  className="text-sm"
                >
                  {passwordStrength.level === 'weak' && '弱'}
                  {passwordStrength.level === 'medium' && '中'}
                  {passwordStrength.level === 'strong' && '强'}
                </Text>
              </div>
              <Progress
                percent={strengthConfig.percent}
                status={strengthConfig.status}
                strokeColor={strengthConfig.color}
                showInfo={false}
              />
              {passwordStrength.suggestions.length > 0 && (
                <div className="text-xs text-gray-500 space-y-1">
                  {passwordStrength.suggestions.map((suggestion: string, index: number) => (
                    <div key={index}>• {suggestion}</div>
                  ))}
                </div>
              )}
            </div>
          </Form.Item>
        )}

        {/* 确认密码 */}
        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="确认密码"
            autoComplete="new-password"
          />
        </Form.Item>

        {/* 注册按钮 */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
            className="h-10"
          >
            {isPending ? '注册中...' : '注册'}
          </Button>
        </Form.Item>

        {/* 登录链接 */}
        <Form.Item>
          <div className="text-center">
            <Text type="secondary" className="text-sm">
              已有账号？
            </Text>
            <Button type="link" onClick={onLoginClick} className="p-0 ml-1">
              立即登录
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}