// src/pages/Login/index.tsx
import { useState } from 'react';
import { Card, Tabs } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '@/components/Auth/LoginForm';
import RegisterForm from '@/components/Auth/RegisterForm';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('login');

  // 获取重定向路径
  const from = (location.state as any)?.from || '/';

  const handleLoginSuccess = () => {
    // 登录成功后跳转到之前的页面或首页
    navigate(from, { replace: true });
  };

  const handleRegisterSuccess = () => {
    // 注册成功后切换到登录标签
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-6">
        <Card
          className="shadow-xl rounded-lg"
          styles={{ body: { padding: '32px' } }}
        >
          {/* Logo 和标题 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">模型评测系统</h1>
            <p className="text-gray-500 mt-2">欢迎使用多模态评测平台</p>
          </div>

          {/* 登录/注册切换 */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              {
                key: 'login',
                label: '登录',
                children: (
                  <LoginForm
                    onSuccess={handleLoginSuccess}
                    onRegisterClick={() => setActiveTab('register')}
                  />
                ),
              },
              {
                key: 'register',
                label: '注册',
                children: (
                  <RegisterForm
                    onSuccess={handleRegisterSuccess}
                    onLoginClick={() => setActiveTab('login')}
                  />
                ),
              },
            ]}
          />
        </Card>

        {/* 页脚 */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2024 模型评测系统. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}