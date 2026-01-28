import { User } from "./user.interface";

export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    user:User;
}
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}