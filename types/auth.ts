export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
}
