import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { 
  ApiResponse, 
  LoginCredentials, 
  AuthResponse,
  ChangePasswordData,
  User,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  PaginatedResponse,
  Role,
  CreateRoleData,
  UpdateRoleData,
  RoleFilters,
  Permission,
  CreatePermissionData,
  UpdatePermissionData,
  PermissionFilters,
  GroupedPermissions,
  AuditLog,
  AuditFilters,
  AuditStats
} from '../types';

// Base API configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh and errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = Cookies.get('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            // Try to refresh the token
            const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            if (refreshResponse.data.success) {
              const { accessToken } = refreshResponse.data.data;
              Cookies.set('accessToken', accessToken, {
                expires: 7,
                secure: false, // Set to true in production
                sameSite: 'strict',
              });

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.message) {
          toast.error(error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    params?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request({
        method,
        url,
        data,
        params,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'An unexpected error occurred'
      );
    }
  }

  // HTTP method helpers
  get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, params);
  }

  post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data);
  }

  put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data);
  }

  patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data);
  }

  delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url);
  }

  // Special method for blob responses (like file downloads)
  async downloadBlob(url: string, params?: any): Promise<Blob> {
    try {
      const response = await this.client.request({
        method: 'GET',
        url,
        params,
        responseType: 'blob',
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Download failed'
      );
    }
  }
}

// Create API client instance
const apiClient = new ApiClient();

// Authentication API
export const authApi = {
  login: (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post('/auth/login', credentials),
  
  logout: (data: { refreshToken: string }): Promise<ApiResponse> =>
    apiClient.post('/auth/logout', data),
  
  logoutAll: (): Promise<ApiResponse> =>
    apiClient.post('/auth/logout-all'),
  
  refreshToken: (data: { refreshToken: string }): Promise<ApiResponse<{ accessToken: string }>> =>
    apiClient.post('/auth/refresh', data),
  
  getProfile: (): Promise<ApiResponse<User>> =>
    apiClient.get('/auth/me'),
  
  changePassword: (data: ChangePasswordData): Promise<ApiResponse> =>
    apiClient.post('/auth/change-password', data),
  
  forgotPassword: (email: string): Promise<ApiResponse> =>
    apiClient.post('/auth/forgot-password', { email }),
  
  resetPassword: (data: { token: string; password: string }): Promise<ApiResponse> =>
    apiClient.post('/auth/reset-password', data),
};

// Users API
export const usersApi = {
  getUsers: (filters: UserFilters): Promise<ApiResponse<PaginatedResponse<User>>> =>
    apiClient.get('/users', filters),
  
  getUser: (id: string): Promise<ApiResponse<User>> =>
    apiClient.get(`/users/${id}`),
  
  createUser: (data: CreateUserData): Promise<ApiResponse<User>> =>
    apiClient.post('/users', data),
  
  updateUser: (id: string, data: UpdateUserData): Promise<ApiResponse<User>> =>
    apiClient.put(`/users/${id}`, data),
  
  deleteUser: (id: string): Promise<ApiResponse> =>
    apiClient.delete(`/users/${id}`),
  
  activateUser: (id: string): Promise<ApiResponse<User>> =>
    apiClient.patch(`/users/${id}/activate`),
  
  updateUserRoles: (id: string, roles: string[]): Promise<ApiResponse<User>> =>
    apiClient.put(`/users/${id}/roles`, { roles }),
  
  toggleUserStatus: (id: string, isActive: boolean): Promise<ApiResponse<User>> =>
    apiClient.patch(`/users/${id}/status`, { isActive }),
};

// Roles API
export const rolesApi = {
  getRoles: (filters: RoleFilters): Promise<ApiResponse<PaginatedResponse<Role>>> =>
    apiClient.get('/roles', filters),
  
  getRole: (id: string): Promise<ApiResponse<Role>> =>
    apiClient.get(`/roles/${id}`),
  
  createRole: (data: CreateRoleData): Promise<ApiResponse<Role>> =>
    apiClient.post('/roles', data),
  
  updateRole: (id: string, data: UpdateRoleData): Promise<ApiResponse<Role>> =>
    apiClient.put(`/roles/${id}`, data),
  
  deleteRole: (id: string): Promise<ApiResponse> =>
    apiClient.delete(`/roles/${id}`),
  
  updateRolePermissions: (id: string, permissions: string[]): Promise<ApiResponse<Role>> =>
    apiClient.put(`/roles/${id}/permissions`, { permissions }),
  
  getRoleUsers: (id: string): Promise<ApiResponse<{ role: Role; users: User[]; userCount: number }>> =>
    apiClient.get(`/roles/${id}/users`),
};

// Permissions API
export const permissionsApi = {
  getPermissions: (filters: PermissionFilters): Promise<ApiResponse<PaginatedResponse<Permission>>> =>
    apiClient.get('/permissions', filters),
  
  getGroupedPermissions: (): Promise<ApiResponse<GroupedPermissions>> =>
    apiClient.get('/permissions/grouped'),
  
  getPermission: (id: string): Promise<ApiResponse<{ permission: Permission; roles: Role[] }>> =>
    apiClient.get(`/permissions/${id}`),
  
  createPermission: (data: CreatePermissionData): Promise<ApiResponse<Permission>> =>
    apiClient.post('/permissions', data),
  
  createPermissionsBulk: (permissions: CreatePermissionData[]): Promise<ApiResponse<Permission[]>> =>
    apiClient.post('/permissions/bulk', { permissions }),
  
  updatePermission: (id: string, data: UpdatePermissionData): Promise<ApiResponse<Permission>> =>
    apiClient.put(`/permissions/${id}`, data),
  
  deletePermission: (id: string): Promise<ApiResponse> =>
    apiClient.delete(`/permissions/${id}`),
  
  getResources: (): Promise<ApiResponse<string[]>> =>
    apiClient.get('/permissions/meta/resources'),
  
  getActions: (): Promise<ApiResponse<string[]>> =>
    apiClient.get('/permissions/meta/actions'),
};

// Audit API
export const auditApi = {
  getAuditLogs: (filters: AuditFilters): Promise<ApiResponse<PaginatedResponse<AuditLog>>> =>
    apiClient.get('/audit', filters),
  
  getRecentActivity: (limit?: number): Promise<ApiResponse<AuditLog[]>> =>
    apiClient.get('/audit/recent', { limit }),
  
  getUserActivity: (userId: string, limit?: number): Promise<ApiResponse<AuditLog[]>> =>
    apiClient.get(`/audit/user/${userId}`, { limit }),
  
  getAuditStats: (days?: number): Promise<ApiResponse<AuditStats>> =>
    apiClient.get('/audit/stats', { days }),

  exportLogs: (filters: any): Promise<Blob> =>
    apiClient.downloadBlob('/audit/export', filters),
};

export default apiClient;
export { apiClient as api };
