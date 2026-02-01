import { User } from "./user.interface";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}

export interface RegisterResponse {
  token: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}