export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
  };
}

export interface SignupData {
  email: string;
  password: string;
}

export interface SigninData {
  email: string;
  password: string;
}
