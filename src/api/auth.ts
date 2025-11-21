import client from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/auth';

export const authApi = {
  // 登录
  login: (data: LoginRequest) => {
    return client.post<LoginResponse>('/auth/login', data);
  },

  // 注册
  register: (data: RegisterRequest) => {
    return client.post<User>('/auth/register', data);
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    return client.get<User>('/auth/me');
  },
};