// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: string[];
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Specific API response types for React Query
export interface UsersResponse extends PaginatedResponse<User> {
  users: User[];
  total: number;
  page: number;
  pages: number;
}

export interface RolesResponse extends PaginatedResponse<Role> {
  roles: Role[];
  total: number;
  page: number;
  pages: number;
}

export interface PermissionsResponse extends PaginatedResponse<Permission> {
  permissions: Permission[];
  total: number;
  page: number;
  pages: number;
}

export interface AuditLogsResponse extends PaginatedResponse<AuditLog> {
  logs: AuditLog[];
  total: number;
  page: number;
  pages: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// User types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  roles: Role[];
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface UserFilters extends PaginationParams {
  isActive?: boolean;
}

// Role types
export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface RoleFilters extends PaginationParams {
  isActive?: boolean;
}

// Permission types
export interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionData {
  resource: string;
  action: string;
  description: string;
}

export interface UpdatePermissionData {
  resource?: string;
  action?: string;
  description?: string;
}

export interface PermissionFilters extends PaginationParams {
  resource?: string;
  action?: string;
}

export interface GroupedPermissions {
  [resource: string]: Permission[];
}

// Audit types
export interface AuditLog {
  _id: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'assign_role' | 'remove_role' | 'permission_change';
  resource: string;
  resourceId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  userEmail: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditFilters extends PaginationParams {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditStats {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  totalActivities: number;
  activityByAction: Array<{ _id: string; count: number }>;
  activityByResource: Array<{ _id: string; count: number }>;
  activityByDay: Array<{ _id: string; count: number }>;
  topUsers: Array<{
    _id: string;
    count: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

// UI types
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T, value: any) => React.ReactNode;
  className?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'multiselect' | 'checkbox' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: Record<string, any>;
  disabled?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

// Store types
export interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  refreshAccessToken: () => Promise<boolean>;
  checkAuth: () => void;
}

// Error types
export interface ApiError {
  message: string;
  statusCode?: number;
  details?: any;
}

// Form types
export interface FormErrors {
  [key: string]: string;
}

export interface LoadingState {
  [key: string]: boolean;
}
