export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user' | 'viewer';
  is_active: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}