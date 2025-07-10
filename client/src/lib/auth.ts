import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Institution {
  id: number;
  name: string;
  type: string;
  educationSystem: string;
  location?: string;
  size?: string;
  isConfigured: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  institution?: Institution;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const data = await response.json();
    
    // Store token in localStorage
    localStorage.setItem("token", data.token);
    
    return data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    const data = await response.json();
    
    // Store token in localStorage
    localStorage.setItem("token", data.token);
    
    return data;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    return response.json();
  },

  logout() {
    localStorage.removeItem("token");
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },
};
