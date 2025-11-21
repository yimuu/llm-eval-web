// src/components/Auth/PrivateRoute.tsx
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRoles?: string | string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * 权限路由组件
 * 用于保护需要登录或特定角色才能访问的路由
 */
export default function PrivateRoute({
  children,
  requiredRoles,
  fallback,
  redirectTo = '/login',
}: PrivateRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();

  // 加载中
  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" tip="加载中..." />
        </div>
      )
    );
  }

  // 未登录
  if (!isAuthenticated) {
    // 保存当前路径，登录后可以返回
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 需要特定角色
  if (requiredRoles) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const hasRequiredRole = user && roles.includes(user.role);

    if (!hasRequiredRole) {
      return (
        <Result
          status="403"
          title="403"
          subTitle="抱歉，您没有权限访问此页面"
          icon={<LockOutlined />}
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              返回上一页
            </Button>
          }
        />
      );
    }
  }

  // 有权限，渲染子组件
  return <>{children}</>;
}

/**
 * 需要登录的路由
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  return <PrivateRoute>{children}</PrivateRoute>;
}

/**
 * 需要管理员权限的路由
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  return <PrivateRoute requiredRoles="admin">{children}</PrivateRoute>;
}

/**
 * 需要用户权限的路由（管理员和普通用户）
 */
export function RequireUser({ children }: { children: ReactNode }) {
  return <PrivateRoute requiredRoles={['admin', 'user']}>{children}</PrivateRoute>;
}

/**
 * 需要查看权限的路由（所有已登录用户）
 */
export function RequireViewer({ children }: { children: ReactNode }) {
  return <PrivateRoute requiredRoles={['admin', 'user', 'viewer']}>{children}</PrivateRoute>;
}