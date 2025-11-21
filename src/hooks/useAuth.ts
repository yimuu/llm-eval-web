// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { message } from 'antd';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest, RegisterRequest } from '@/types/auth';

/**
 * 登录 Hook
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: async (data) => {
      // 保存 token
      setToken(data.access_token);
      
      // 获取用户信息
      try {
        const user = await authApi.getCurrentUser();
        setUser(user);
        message.success('登录成功');
        navigate('/');
      } catch (error) {
        message.error('获取用户信息失败');
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || '登录失败');
    },
  });
};

/**
 * 注册 Hook
 */
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      message.success('注册成功，请登录');
      navigate('/login');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || '注册失败');
    },
  });
};

/**
 * 登出 Hook
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return () => {
    logout();
    message.success('已退出登录');
    navigate('/login');
  };
};

/**
 * 当前用户信息 Hook
 */
export const useCurrentUser = () => {
  const { user, token, fetchUser } = useAuthStore();

  const query = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: !!token && !user,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  });

  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  return {
    user: user || query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

/**
 * 认证状态 Hook
 */
export const useAuth = () => {
  const { isAuthenticated, token, user } = useAuthStore();
  const { user: currentUser, isLoading } = useCurrentUser();

  return {
    isAuthenticated,
    token,
    user: user || currentUser,
    isLoading,
  };
};

/**
 * 权限检查 Hook
 */
export const usePermission = () => {
  const { user } = useAuth();

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const isAdmin = () => hasRole('admin');
  const isUser = () => hasRole(['admin', 'user']);
  const isViewer = () => hasRole(['admin', 'user', 'viewer']);

  return {
    hasRole,
    isAdmin,
    isUser,
    isViewer,
  };
};

/**
 * 需要认证的路由守卫 Hook
 */
export const useRequireAuth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      message.warning('请先登录');
      navigate('/login');
    }
  }, [isAuthenticated, token, navigate]);

  return isAuthenticated;
};

/**
 * 需要特定角色的路由守卫 Hook
 */
export const useRequireRole = (requiredRoles: string | string[]) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasRole } = usePermission();

  useEffect(() => {
    if (user && !hasRole(requiredRoles)) {
      message.error('权限不足');
      navigate('/');
    }
  }, [user, requiredRoles, hasRole, navigate]);

  return hasRole(requiredRoles);
};

/**
 * 自动登录 Hook（从 localStorage 恢复会话）
 */
export const useAutoLogin = () => {
  const { token, user, fetchUser } = useAuthStore();

  useEffect(() => {
    // 如果有 token 但没有用户信息，自动获取
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);
};

/**
 * 登录状态持久化 Hook
 */
export const usePersistAuth = () => {
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);
};

/**
 * Token 过期检查 Hook
 */
export const useTokenExpiration = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    // 解析 JWT token 获取过期时间
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // 转换为毫秒
      const currentTime = Date.now();

      if (expirationTime < currentTime) {
        // Token 已过期
        message.warning('登录已过期，请重新登录');
        logout();
        navigate('/login');
      } else {
        // 设置定时器，在 token 过期前提醒
        const timeUntilExpiration = expirationTime - currentTime;
        const reminderTime = Math.max(0, timeUntilExpiration - 5 * 60 * 1000); // 提前5分钟提醒

        const timer = setTimeout(() => {
          message.warning('登录即将过期，请重新登录');
        }, reminderTime);

        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Token 解析失败:', error);
    }
  }, [token, logout, navigate]);
};

/**
 * 记住我功能 Hook
 */
export const useRememberMe = () => {
  const REMEMBER_ME_KEY = 'remember_me';
  const USERNAME_KEY = 'remembered_username';

  const saveCredentials = (username: string, remember: boolean) => {
    if (remember) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      localStorage.setItem(USERNAME_KEY, username);
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem(USERNAME_KEY);
    }
  };

  const getRememberedUsername = (): string | null => {
    const shouldRemember = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    if (shouldRemember) {
      return localStorage.getItem(USERNAME_KEY);
    }
    return null;
  };

  const clearRememberedCredentials = () => {
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(USERNAME_KEY);
  };

  return {
    saveCredentials,
    getRememberedUsername,
    clearRememberedCredentials,
  };
};

/**
 * 密码强度检查 Hook
 */
export const usePasswordStrength = () => {
  const checkStrength = (password: string): {
    score: number;
    level: 'weak' | 'medium' | 'strong';
    suggestions: string[];
  } => {
    let score = 0;
    const suggestions: string[] = [];

    // 长度检查
    if (password.length >= 8) {
      score += 1;
    } else {
      suggestions.push('密码至少需要8个字符');
    }

    // 包含小写字母
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('建议包含小写字母');
    }

    // 包含大写字母
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('建议包含大写字母');
    }

    // 包含数字
    if (/\d/.test(password)) {
      score += 1;
    } else {
      suggestions.push('建议包含数字');
    }

    // 包含特殊字符
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('建议包含特殊字符');
    }

    let level: 'weak' | 'medium' | 'strong';
    if (score <= 2) {
      level = 'weak';
    } else if (score <= 3) {
      level = 'medium';
    } else {
      level = 'strong';
    }

    return { score, level, suggestions };
  };

  return { checkStrength };
};

/**
 * 登录历史记录 Hook
 */
export const useLoginHistory = () => {
  const LOGIN_HISTORY_KEY = 'login_history';
  const MAX_HISTORY_COUNT = 5;

  const addLoginRecord = (username: string) => {
    const history = getLoginHistory();
    const newRecord = {
      username,
      timestamp: new Date().toISOString(),
    };

    // 移除重复的用户名
    const filteredHistory = history.filter((record) => record.username !== username);
    
    // 添加新记录到开头
    const updatedHistory = [newRecord, ...filteredHistory].slice(0, MAX_HISTORY_COUNT);
    
    localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const getLoginHistory = (): Array<{ username: string; timestamp: string }> => {
    const history = localStorage.getItem(LOGIN_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  };

  const clearLoginHistory = () => {
    localStorage.removeItem(LOGIN_HISTORY_KEY);
  };

  return {
    addLoginRecord,
    getLoginHistory,
    clearLoginHistory,
  };
};