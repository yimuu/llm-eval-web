// src/pages/Login/index.tsx
import { useState } from 'react';
import { Card, Tabs, ConfigProvider } from 'antd';
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 动态背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 主要渐变球 */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full opacity-30 blur-3xl animate-blob"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            animation: 'blob 7s infinite',
          }}
        ></div>
        <div
          className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full opacity-30 blur-3xl animate-blob animation-delay-2000"
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            animation: 'blob 7s infinite 2s',
          }}
        ></div>
        <div
          className="absolute -bottom-[20%] left-[20%] w-[550px] h-[550px] rounded-full opacity-30 blur-3xl animate-blob animation-delay-4000"
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            animation: 'blob 7s infinite 4s',
          }}
        ></div>

        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #8b5cf6 1px, transparent 1px),
              linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      <div className="w-full max-w-[480px] px-6 relative z-10">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#6366f1',
              borderRadius: 12,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            },
            components: {
              Card: {
                boxShadowTertiary: '0 0 0 1px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.08)',
              },
              Tabs: {
                itemSelectedColor: '#6366f1',
                itemHoverColor: '#818cf8',
                inkBarColor: '#6366f1',
                titleFontSize: 16,
              },
              Input: {
                controlHeight: 44,
                fontSize: 15,
              },
              Button: {
                controlHeight: 44,
                fontSize: 15,
                fontWeight: 500,
              }
            }
          }}
        >
          {/* 主卡片 */}
          <Card
            className="border-0 backdrop-blur-xl bg-white/90 shadow-2xl"
            styles={{
              body: {
                padding: '48px 40px',
              }
            }}
            style={{
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            {/* Logo 和标题区域 */}
            <div className="text-center mb-10">
              {/* Logo 图标 */}
              <div className="inline-flex items-center justify-center mb-6">
                <div
                  className="relative w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-6 cursor-pointer overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
                  }}
                >
                  {/* 精美的图标 */}
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="drop-shadow-lg"
                  >
                    {/* 星星/火花图标 */}
                    <path
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                      fill="white"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {/* 光晕效果 */}
                  <div
                    className="absolute inset-0 rounded-3xl animate-pulse"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      filter: 'blur(20px)',
                      opacity: 0.5,
                      zIndex: -1,
                    }}
                  ></div>
                </div>
              </div>

              {/* 标题 */}
              <h1
                className="text-3xl font-bold mb-2 tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                模型评测系统
              </h1>
              <p className="text-gray-600 text-base">
                欢迎使用
                <span className="font-semibold text-indigo-600 mx-1">多模态评测平台</span>
              </p>
            </div>

            {/* 登录/注册切换标签 */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              centered
              size="large"
              className="custom-tabs"
              items={[
                {
                  key: 'login',
                  label: <span className="px-3 font-medium">登录账号</span>,
                  children: (
                    <div className="pt-6">
                      <LoginForm
                        onSuccess={handleLoginSuccess}
                        onRegisterClick={() => setActiveTab('register')}
                      />
                    </div>
                  ),
                },
                {
                  key: 'register',
                  label: <span className="px-3 font-medium">注册账号</span>,
                  children: (
                    <div className="pt-6">
                      <RegisterForm
                        onSuccess={handleRegisterSuccess}
                        onLoginClick={() => setActiveTab('login')}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </ConfigProvider>

        {/* 页脚信息 */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-500 font-medium">
            © 2024 模型评测系统. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
            <a href="#" className="hover:text-indigo-600 transition-colors">隐私政策</a>
            <span>•</span>
            <a href="#" className="hover:text-indigo-600 transition-colors">服务条款</a>
            <span>•</span>
            <a href="#" className="hover:text-indigo-600 transition-colors">帮助中心</a>
          </div>
        </div>
      </div>

      {/* 添加自定义 CSS 动画 */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .custom-tabs .ant-tabs-tab {
          padding: 12px 0;
          transition: all 0.3s ease;
        }

        .custom-tabs .ant-tabs-tab:hover {
          color: #818cf8 !important;
        }

        .custom-tabs .ant-tabs-tab-active {
          font-weight: 600;
        }

        .custom-tabs .ant-tabs-ink-bar {
          height: 3px;
          border-radius: 3px 3px 0 0;
        }

        /* 输入框聚焦效果 */
        .ant-input:focus,
        .ant-input-focused,
        .ant-input-password:focus,
        .ant-input-password-focused {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        /* 按钮悬停效果 */
        .ant-btn-primary:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
        }

        .ant-btn-primary:not(:disabled):active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}