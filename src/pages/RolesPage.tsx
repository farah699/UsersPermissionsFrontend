import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { rolesApi, permissionsApi } from '../services/api';
import { Role, Permission, CreateRoleData, UpdateRoleData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface RolesResponse {
  roles: Role[];
  total: number;
  page: number;
  pages: number;
}

interface PermissionsResponse {
  permissions: Permission[];
}

const RolesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const limit = 10;

  const queryClient = useQueryClient();

  // Fetch roles
  const { data: rolesData, isLoading: isLoadingRoles, error: rolesError } = useQuery<RolesResponse>({
    queryKey: ['roles', page, search],
    queryFn: async () => {
      const response = await rolesApi.getRoles({
        page,
        limit,
        search
      });
      return response.data;
    }
  });

  // Fetch permissions for dropdown
  const { data: permissionsData } = useQuery<PermissionsResponse>({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await permissionsApi.getPermissions({ page: 1, limit: 100 });
      return response.data;
    }
  });

  // Create role form
  const createForm = useForm<CreateRoleData>({
    defaultValues: {
      name: '',
      description: '',
      permissions: []
    }
  });

  // Edit role form
  const editForm = useForm<UpdateRoleData>();

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: CreateRoleData) => {
      return await rolesApi.createRole(roleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowCreateModal(false);
      createForm.reset();
    },
    onError: (error: any) => {
      console.error('Create role error:', error);
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoleData }) => {
      return await rolesApi.updateRole(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowEditModal(false);
      setSelectedRole(null);
    },
    onError: (error: any) => {
      console.error('Update role error:', error);
    }
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      await rolesApi.deleteRole(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowDeleteModal(false);
      setSelectedRole(null);
    },
    onError: (error: any) => {
      console.error('Delete role error:', error);
    }
  });

  // Assign permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
      return await rolesApi.updateRolePermissions(roleId, permissionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowPermissionsModal(false);
      setSelectedRole(null);
    },
    onError: (error: any) => {
      console.error('Assign permissions error:', error);
    }
  });

  const handleCreateRole = (data: CreateRoleData) => {
    createRoleMutation.mutate(data);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    editForm.reset({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(permission => permission._id)
    });
    setShowEditModal(true);
  };

  const handleUpdateRole = (data: UpdateRoleData) => {
    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole._id, data });
    }
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const confirmDeleteRole = () => {
    if (selectedRole) {
      deleteRoleMutation.mutate(selectedRole._id);
    }
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
  };

  const handleAssignPermissions = (data: { permissions: string[] }) => {
    if (selectedRole) {
      updatePermissionsMutation.mutate({
        roleId: selectedRole._id,
        permissionIds: data.permissions
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const totalPages = rolesData?.pages || 0;

  if (isLoadingRoles) return <LoadingSpinner />;
  if (rolesError) return <div className="text-red-600">Error loading roles</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Roles Management</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage roles and their associated permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Role
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Search Roles
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or description..."
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

      {/* Roles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rolesData?.roles.map((role) => (
          <div key={role._id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary-100 flex items-center justify-center">
                    <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-secondary-900">{role.name}</h3>
                    <p className="text-sm text-secondary-500">{role.description}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-secondary-700">Permissions</span>
                  <span className="text-sm text-secondary-500">{role.permissions.length}</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {role.permissions.length > 0 ? (
                    role.permissions.map((permission) => (
                      <div key={permission._id} className="flex items-center text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                          {permission.action}:{permission.resource}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-secondary-400 italic">No permissions assigned</div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-secondary-500 mb-4">
                <span>Created: {new Date(role.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleManagePermissions(role)}
                  className="text-indigo-600 hover:text-indigo-900"
                  title="Manage permissions"
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEditRole(role)}
                  className="text-indigo-600 hover:text-indigo-900"
                  title="Edit role"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteRole(role)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete role"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-700">
                  Showing{' '}
                  <span className="font-medium">{(page - 1) * limit + 1}</span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(page * limit, rolesData?.total || 0)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{rolesData?.total || 0}</span>{' '}
                  results
                </p>
              </div>
              <div className="flex space-x-2">
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
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-secondary-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-secondary-900">Create New Role</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={createForm.handleSubmit(handleCreateRole)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Role Name
                  </label>
                  <input
                    {...createForm.register('name', { required: 'Role name is required' })}
                    className="input"
                    placeholder="Enter role name"
                  />
                  {createForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...createForm.register('description', { required: 'Description is required' })}
                    className="input"
                    rows={3}
                    placeholder="Enter role description"
                  />
                  {createForm.formState.errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.formState.errors.description.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Permissions
                  </label>
                  <select
                    {...createForm.register('permissions')}
                    multiple
                    className="input"
                    size={6}
                  >
                    {permissionsData?.permissions.map((permission) => (
                      <option key={permission._id} value={permission._id}>
                        {permission.action}:{permission.resource} - {permission.description}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-secondary-500">
                    Hold Ctrl/Cmd to select multiple permissions
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
                    disabled={createRoleMutation.isPending}
                    className="btn btn-primary"
                  >
                    {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-secondary-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-secondary-900">Edit Role</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={editForm.handleSubmit(handleUpdateRole)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Role Name
                  </label>
                  <input
                    {...editForm.register('name', { required: 'Role name is required' })}
                    className="input"
                    placeholder="Enter role name"
                  />
                  {editForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...editForm.register('description', { required: 'Description is required' })}
                    className="input"
                    rows={3}
                    placeholder="Enter role description"
                  />
                  {editForm.formState.errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.formState.errors.description.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Permissions
                  </label>
                  <select
                    {...editForm.register('permissions')}
                    multiple
                    className="input"
                    size={6}
                  >
                    {permissionsData?.permissions.map((permission) => (
                      <option key={permission._id} value={permission._id}>
                        {permission.action}:{permission.resource} - {permission.description}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-secondary-500">
                    Hold Ctrl/Cmd to select multiple permissions
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
                    disabled={updateRoleMutation.isPending}
                    className="btn btn-primary"
                  >
                    {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manage Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-secondary-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-secondary-900">
                  Manage Permissions: {selectedRole.name}
                </h3>
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const permissions = Array.from(formData.getAll('permissions')) as string[];
                  handleAssignPermissions({ permissions });
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Available Permissions
                  </label>
                  <div className="max-h-64 overflow-y-auto space-y-2 border border-secondary-200 rounded-md p-3">
                    {permissionsData?.permissions.map((permission) => (
                      <label key={permission._id} className="flex items-center">
                        <input
                          type="checkbox"
                          name="permissions"
                          value={permission._id}
                          defaultChecked={selectedRole.permissions.some(p => p._id === permission._id)}
                          className="rounded border-secondary-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-secondary-700">
                          <span className="font-medium">
                            {permission.action}:{permission.resource}
                          </span>
                          <span className="text-secondary-500"> - {permission.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPermissionsModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatePermissionsMutation.isPending}
                    className="btn btn-primary"
                  >
                    {updatePermissionsMutation.isPending ? 'Updating...' : 'Update Permissions'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-secondary-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">Delete Role</h3>
              <p className="text-sm text-secondary-500 mb-4">
                Are you sure you want to delete the role{' '}
                <strong>{selectedRole.name}</strong>?{' '}
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
                  onClick={confirmDeleteRole}
                  disabled={deleteRoleMutation.isPending}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                >
                  {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;
