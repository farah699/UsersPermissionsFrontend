import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { usersApi, rolesApi } from '../services/api';
import { User, Role, CreateUserData, UpdateUserData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pages: number;
}

interface RolesResponse {
  roles: Role[];
}

const UsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const limit = 10;

  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useQuery<UsersResponse>({
    queryKey: ['users', page, search, sortBy, sortOrder],
    queryFn: async () => {
      const response = await usersApi.getUsers({
        page,
        limit,
        search,
        sortBy,
        sortOrder
      });
      return response.data;
    }
  });

  // Fetch roles for dropdown
  const { data: rolesData } = useQuery<RolesResponse>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await rolesApi.getRoles({ page: 1, limit: 100 });
      return response.data;
    }
  });

  // Create user form
  const createForm = useForm<CreateUserData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roles: []
    }
  });

  // Edit user form
  const editForm = useForm<UpdateUserData>();

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const response = await usersApi.createUser(userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreateModal(false);
      createForm.reset();
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
      const response = await usersApi.updateUser(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowEditModal(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      console.error('Update user error:', error);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await usersApi.deleteUser(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowDeleteModal(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
    }
  });

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await usersApi.toggleUserStatus(id, isActive);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('Toggle user status error:', error);
    }
  });

  const handleCreateUser = (data: CreateUserData) => {
    createUserMutation.mutate(data);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles.map(role => role._id)
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = (data: UpdateUserData) => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser._id, data });
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser._id);
    }
  };

  const handleToggleUserStatus = (user: User) => {
    toggleUserStatusMutation.mutate({
      id: user._id,
      isActive: !user.isActive
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const totalPages = usersData?.pages || 0;

  if (isLoadingUsers) return <LoadingSpinner />;
  if (usersError) return <div className="text-red-600">Error loading users</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Users Management</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Search Users
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="input pl-10"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400 absolute left-3 top-3" />
              </div>
            </div>
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="btn btn-outline"
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100"
                    onClick={() => handleSort('firstName')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      {sortBy === 'firstName' && (
                        <span className="text-primary-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Email</span>
                      {sortBy === 'email' && (
                        <span className="text-primary-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100"
                    onClick={() => handleSort('isActive')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortBy === 'isActive' && (
                        <span className="text-primary-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100"
                    onClick={() => handleSort('lastLogin')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Last Login</span>
                      {sortBy === 'lastLogin' && (
                        <span className="text-primary-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {usersData?.users.map((user) => (
                  <tr key={user._id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-800">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-secondary-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role._id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {role.name}
                          </span>
                        ))}
                        {user.roles.length === 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                            No roles
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? (
                          <CheckIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <XMarkIcon className="h-3 w-3 mr-1" />
                        )}
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit user"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete user"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-secondary-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="btn btn-outline"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="btn btn-outline"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-secondary-700">
                    Showing{' '}
                    <span className="font-medium">{(page - 1) * limit + 1}</span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(page * limit, usersData?.total || 0)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{usersData?.total || 0}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(pageNum => 
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        Math.abs(pageNum - page) <= 2
                      )
                      .map((pageNum, index, array) => (
                        <React.Fragment key={pageNum}>
                          {index > 0 && array[index - 1] !== pageNum - 1 && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-secondary-300 bg-white text-sm font-medium text-secondary-700">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNum
                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                : 'bg-white border-secondary-300 text-secondary-500 hover:bg-secondary-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-secondary-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-secondary-900">Create New User</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    First Name
                  </label>
                  <input
                    {...createForm.register('firstName', { required: 'First name is required' })}
                    className="input"
                    placeholder="Enter first name"
                  />
                  {createForm.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Last Name
                  </label>
                  <input
                    {...createForm.register('lastName', { required: 'Last name is required' })}
                    className="input"
                    placeholder="Enter last name"
                  />
                  {createForm.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...createForm.register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="input"
                    placeholder="Enter email address"
                  />
                  {createForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    {...createForm.register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className="input"
                    placeholder="Enter password"
                  />
                  {createForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Roles
                  </label>
                  <select
                    {...createForm.register('roles')}
                    multiple
                    className="input"
                    size={4}
                  >
                    {rolesData?.roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-secondary-500">
                    Hold Ctrl/Cmd to select multiple roles
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="btn btn-primary"
                  >
                    {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-secondary-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-secondary-900">Edit User</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    First Name
                  </label>
                  <input
                    {...editForm.register('firstName', { required: 'First name is required' })}
                    className="input"
                    placeholder="Enter first name"
                  />
                  {editForm.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Last Name
                  </label>
                  <input
                    {...editForm.register('lastName', { required: 'Last name is required' })}
                    className="input"
                    placeholder="Enter last name"
                  />
                  {editForm.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...editForm.register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="input"
                    placeholder="Enter email address"
                  />
                  {editForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Roles
                  </label>
                  <select
                    {...editForm.register('roles')}
                    multiple
                    className="input"
                    size={4}
                  >
                    {rolesData?.roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-secondary-500">
                    Hold Ctrl/Cmd to select multiple roles
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateUserMutation.isPending}
                    className="btn btn-primary"
                  >
                    {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-secondary-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">Delete User</h3>
              <p className="text-sm text-secondary-500 mb-4">
                Are you sure you want to delete{' '}
                <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>?{' '}
                This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={deleteUserMutation.isPending}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                >
                  {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
