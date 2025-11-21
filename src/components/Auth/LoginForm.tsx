// src/components/Auth/LoginForm.tsx
import { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Alert, Space, Divider, Typography } from 'antd';
import { UserOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { useLogin, useRememberMe, useLoginHistory } from '@/hooks/useAuth';
import type { LoginRequest } from '@/types/auth';

const { Text, Link } = Typography;

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
  showRememberMe?: boolean;
  showRegisterLink?: boolean;
}

export default function LoginForm({
  onSuccess,
  onRegisterClick,
  showRememberMe = true,
  showRegisterLink = true,
}: LoginFormProps) {
  const [form] = Form.useForm();
  const { mutate: login, isPending, error } = useLogin();
  const { saveCredentials, getRememberedUsername } = useRememberMe();
  const { getLoginHistory, addLoginRecord } = useLoginHistory();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // 加载记住的用户名
  useEffect(() => {
    const rememberedUsername = getRememberedUsername();
    if (rememberedUsername) {
      form.setFieldsValue({
        username: rememberedUsername,
        rememberMe: true,
      });
    }
  }, [form, getRememberedUsername]);

  // 处理登录
  const handleSubmit = async (values: LoginRequest & { rememberMe?: boolean }) => {
    setLoginError(null);

    login(
      {
        username: values.username,
        password: values.password,
      },
      {
        onSuccess: () => {
          // 保存记住我设置
          if (showRememberMe) {
            saveCredentials(values.username, values.rememberMe || false);
          }

          // 记录登录历史
          addLoginRecord(values.username);

          // 回调
          onSuccess?.();
        },
        onError: (err: any) => {
          setLoginError(
            err.response?.data?.detail || err.message || '登录失败，请检查用户名和密码'
          );
        },
      }
    );
  };

  // 获取登录历史
  const loginHistory = getLoginHistory();

  return (
    <div className="login-form-container">
      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
        layout="vertical"
      >
        {/* 错误提示 */}
        {loginError && (
          <Form.Item>
            <Alert
              message="登录失败"
              description={loginError}
              type="error"
              showIcon
              closable
              onClose={() => setLoginError(null)}
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
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="用户名"
            autoComplete="username"
            allowClear
          />
        </Form.Item>

        {/* 密码 */}
        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少 6 个字符' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="密码"
            autoComplete="current-password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            visibilityToggle={{
              visible: showPassword,
              onVisibleChange: setShowPassword,
            }}
          />
        </Form.Item>

        {/* 记住我和忘记密码 */}
        {showRememberMe && (
          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Link href="#" className="text-sm">
                忘记密码？
              </Link>
            </div>
          </Form.Item>
        )}

        {/* 登录历史提示 */}
        {loginHistory.length > 0 && (
          <Form.Item>
            <div className="text-sm text-gray-500">
              <Text type="secondary">最近登录: </Text>
              {loginHistory.slice(0, 3).map((item, index) => (
                <span key={index}>
                  <Link
                    onClick={() => {
                      form.setFieldsValue({ username: item.username });
                    }}
                  >
                    {item.username}
                  </Link>
                  {index < Math.min(loginHistory.length - 1, 2) && ', '}
                </span>
              ))}
            </div>
          </Form.Item>
        )}

        {/* 登录按钮 */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
            className="h-10"
          >
            {isPending ? '登录中...' : '登录'}
          </Button>
        </Form.Item>

        {/* 注册链接 */}
        {showRegisterLink && (
          <>
            <Divider plain>
              <Text type="secondary" className="text-sm">
                没有账号？
              </Text>
            </Divider>
            <Form.Item>
              <Button
                block
                onClick={onRegisterClick}
                className="h-10"
              >
                立即注册
              </Button>
            </Form.Item>
          </>
        )}
      </Form>

      {/* 快捷登录提示（开发环境） */}
      {import.meta.env.DEV && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <Text type="warning">开发环境提示：</Text>
          <div className="mt-1 space-y-1">
            <div>管理员: admin / admin123</div>
            <div>普通用户: user / user123</div>
          </div>
        </div>
      )}
    </div>
  );
}
