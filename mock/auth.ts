import { MockMethod } from 'vite-plugin-mock';

export default [
    // 登录
    {
        url: '/api/v1/auth/login',
        method: 'post',
        response: ({ body }: any) => {
            const { username, password } = body;

            // 模拟验证
            if (username === 'admin' && password === 'admin123') {
                return {
                    token: 'mock-admin-token-' + Date.now(),
                    user: {
                        id: 1,
                        username: 'admin',
                        email: 'admin@example.com',
                        role: 'admin',
                        createdAt: '2024-01-01T00:00:00Z',
                    },
                };
            } else if (username === 'user' && password === 'user123') {
                return {
                    token: 'mock-user-token-' + Date.now(),
                    user: {
                        id: 2,
                        username: 'user',
                        email: 'user@example.com',
                        role: 'user',
                        createdAt: '2024-01-01T00:00:00Z',
                    },
                };
            } else {
                return {
                    code: 401,
                    message: '用户名或密码错误',
                };
            }
        },
    },

    // 注册
    {
        url: '/api/v1/auth/register',
        method: 'post',
        response: ({ body }: any) => {
            const { username, email, password } = body;

            return {
                id: Math.floor(Math.random() * 1000),
                username,
                email,
                role: 'user',
                createdAt: new Date().toISOString(),
            };
        },
    },

    // 获取当前用户信息
    {
        url: '/api/v1/auth/me',
        method: 'get',
        response: () => {
            return {
                id: 1,
                username: 'admin',
                email: 'admin@example.com',
                role: 'admin',
                createdAt: '2024-01-01T00:00:00Z',
            };
        },
    },
] as MockMethod[];
