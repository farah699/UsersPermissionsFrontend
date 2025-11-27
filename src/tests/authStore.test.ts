import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../store/authStore';
import { act, renderHook } from '@testing-library/react';

// Mock Cookies
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    act(() => {
      useAuthStore.getState().logout();
    });
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should login user successfully', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: []
    };
    
    const mockToken = 'fake-jwt-token';
    
    act(() => {
      result.current.login(mockUser, mockToken);
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
  });

  it('should logout user successfully', () => {
    const { result } = renderHook(() => useAuthStore());
    
    // First login
    act(() => {
      result.current.login(
        { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', roles: [] },
        'fake-token'
      );
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    
    // Then logout
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should update user data', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const initialUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: []
    };
    
    // Login first
    act(() => {
      result.current.login(initialUser, 'fake-token');
    });
    
    // Update user
    const updatedData = {
      firstName: 'Updated',
      lastName: 'Name'
    };
    
    act(() => {
      result.current.updateUser(updatedData);
    });
    
    expect(result.current.user?.firstName).toBe('Updated');
    expect(result.current.user?.lastName).toBe('Name');
    expect(result.current.user?.email).toBe('test@example.com'); // Should remain unchanged
  });

  it('should check if user has permission', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const userWithPermissions = {
      id: '1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      roles: [{
        id: '1',
        name: 'Admin',
        permissions: [
          { id: '1', name: 'Create Users', resource: 'user', action: 'create' },
          { id: '2', name: 'Read Users', resource: 'user', action: 'read' }
        ]
      }]
    };
    
    act(() => {
      result.current.login(userWithPermissions, 'fake-token');
    });
    
    expect(result.current.hasPermission('user', 'create')).toBe(true);
    expect(result.current.hasPermission('user', 'read')).toBe(true);
    expect(result.current.hasPermission('user', 'delete')).toBe(false);
    expect(result.current.hasPermission('role', 'create')).toBe(false);
  });

  it('should return false for permissions when not authenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.hasPermission('user', 'create')).toBe(false);
    expect(result.current.hasPermission('user', 'read')).toBe(false);
  });
});
