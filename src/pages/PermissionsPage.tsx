import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { permissionsApi } from '../services/api';
import { Permission, CreatePermissionData, UpdatePermissionData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface PermissionsResponse {
  permissions: Permission[];
  total: number;
  page: number;
  pages: number;
}

const PermissionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [filterByResource, setFilterByResource] = useState('');
  const [filterByAction, setFilterByAction] = useState('');
  const limit = 12;

  const queryClient = useQueryClient();

  // Fetch permissions
  const { data: permissionsData, isLoading: isLoadingPermissions, error: permissionsError } = useQuery<PermissionsResponse>({
    queryKey: ['permissions', page, search, filterByResource, filterByAction],
    queryFn: async () => {
      const response = await permissionsApi.getPermissions({
        page,
        limit,
        search,
        resource: filterByResource || undefined,
        action: filterByAction || undefined
      });
      return response.data;
    }
  });

  // Create permission form
  const createForm = useForm<CreatePermissionData>({
    defaultValues: {
      action: '',
      resource: '',
      description: ''
    }
  });

  // Edit permission form
  const editForm = useForm<UpdatePermissionData>();

  // Create permission mutation
  const createPermissionMutation = useMutation({
    mutationFn: async (permissionData: CreatePermissionData) => {
      return await permissionsApi.createPermission(permissionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setShowCreateModal(false);
      createForm.reset();
    },
    onError: (error: any) => {
      console.error('Create permission error:', error);
    }
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePermissionData }) => {
      return await permissionsApi.updatePermission(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setShowEditModal(false);
      setSelectedPermission(null);
    },
    onError: (error: any) => {
      console.error('Update permission error:', error);
    }
  });

  // Delete permission mutation
  const deletePermissionMutation = useMutation({
    mutationFn: async (id: string) => {
      await permissionsApi.deletePermission(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setShowDeleteModal(false);
      setSelectedPermission(null);
    },
    onError: (error: any) => {
      console.error('Delete permission error:', error);
    }
  });

  const handleCreatePermission = (data: CreatePermissionData) => {
    createPermissionMutation.mutate(data);
  };

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    editForm.reset({
      action: permission.action,
      resource: permission.resource,
      description: permission.description
    });
    setShowEditModal(true);
  };

  const handleUpdatePermission = (data: UpdatePermissionData) => {
    if (selectedPermission) {
      updatePermissionMutation.mutate({ id: selectedPermission._id, data });
    }
  };

  const handleDeletePermission = (permission: Permission) => {
    setSelectedPermission(permission);
    setShowDeleteModal(true);
  };

  const confirmDeletePermission = () => {
    if (selectedPermission) {
      deletePermissionMutation.mutate(selectedPermission._id);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // Get unique resources and actions for filters
  const uniqueResources = [...new Set(permissionsData?.permissions.map(p => p.resource) || [])];
  const uniqueActions = [...new Set(permissionsData?.permissions.map(p => p.action) || [])];

  const totalPages = permissionsData?.pages || 0;

  // Common permission templates
  const permissionTemplates = [
    { action: 'create', resource: 'users', description: 'Create new users' },
    { action: 'read', resource: 'users', description: 'View user information' },
    { action: 'update', resource: 'users', description: 'Update user information' },
    { action: 'delete', resource: 'users', description: 'Delete users' },
    { action: 'create', resource: 'roles', description: 'Create new roles' },
    { action: 'read', resource: 'roles', description: 'View roles' },
    { action: 'update', resource: 'roles', description: 'Update roles' },
    { action: 'delete', resource: 'roles', description: 'Delete roles' },
    { action: 'create', resource: 'permissions', description: 'Create new permissions' },
    { action: 'read', resource: 'permissions', description: 'View permissions' },
    { action: 'update', resource: 'permissions', description: 'Update permissions' },
    { action: 'delete', resource: 'permissions', description: 'Delete permissions' },
    { action: 'read', resource: 'audit', description: 'View audit logs' },
    { action: 'manage', resource: 'system', description: 'System administration' }
  ];

  const addTemplate = (template: { action: string; resource: string; description: string }) => {
    createForm.setValue('action', template.action);
    createForm.setValue('resource', template.resource);
    createForm.setValue('description', template.description);
    setShowCreateModal(true);
  };

  if (isLoadingPermissions) return <LoadingSpinner />;
  if (permissionsError) return <div className="text-red-600">Error loading permissions</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Permissions Management</h1>
          <p className="mt-1 text-sm text-secondary-600">
            View and manage system permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Permission
        </button>
      </div>

      {/* Quick Templates */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Add Common Permissions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {permissionTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => addTemplate(template)}
                className="px-3 py-2 text-sm bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors"
              >
                {template.action}:{template.resource}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Search Permissions
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search permissions..."
                    className="input pl-10"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400 absolute left-3 top-3" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Filter by Resource
                </label>
                <select
                  value={filterByResource}
                  onChange={(e) => setFilterByResource(e.target.value)}
                  className="input"
                >
                  <option value="">All Resources</option>
                  {uniqueResources.map((resource) => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Filter by Action
                </label>
                <select
                  value={filterByAction}
                  onChange={(e) => setFilterByAction(e.target.value)}
                  className="input"
                >
                  <option value="">All Actions</option>
                  {uniqueActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn btn-secondary w-full">
                  Apply Filters
                </button>
              </div>
            </div>
            {(search || filterByResource || filterByAction) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setFilterByResource('');
                  setFilterByAction('');
                  setPage(1);
                }}
                className="btn btn-outline"
              >
                Clear All Filters
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {permissionsData?.permissions.map((permission) => (
          <div key={permission._id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <KeyIcon className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-secondary-900">
                      {permission.action}
                    </div>
                    <div className="text-xs text-secondary-500">
                      on {permission.resource}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-secondary-600 line-clamp-2">
                  {permission.description}
                </p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {permission.action}:{permission.resource}
                </span>
              </div>

              <div className="text-xs text-secondary-500 mb-3">
                Created: {new Date(permission.createdAt).toLocaleDateString()}
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleEditPermission(permission)}
                  className="text-indigo-600 hover:text-indigo-900"
                  title="Edit permission"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeletePermission(permission)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete permission"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {permissionsData?.permissions.length === 0 && (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-12">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-secondary-400" />
              <h3 className="mt-2 text-sm font-medium text-secondary-900">No permissions found</h3>
              <p className="mt-1 text-sm text-secondary-500">
                Get started by creating your first permission.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Permission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    {Math.min(page * limit, permissionsData?.total || 0)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{permissionsData?.total || 0}</span>{' '}
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

      {/* Create Permission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-secondary-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-secondary-900">Create New Permission</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={createForm.handleSubmit(handleCreatePermission)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Action
                  </label>
                  <input
                    {...createForm.register('action', { required: 'Action is required' })}
                    className="input"
                    placeholder="e.g., create, read, update, delete"
                  />
                  {createForm.formState.errors.action && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.formState.errors.action.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Resource
                  </label>
                  <input
                    {...createForm.register('resource', { required: 'Resource is required' })}
                    className="input"
                    placeholder="e.g., users, roles, permissions"
                  />
                  {createForm.formState.errors.resource && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.formState.errors.resource.message}
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
                    placeholder="Describe what this permission allows"
                  />
                  {createForm.formState.errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.formState.errors.description.message}
                    </p>
                  )}
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
                    disabled={createPermissionMutation.isPending}
                    className="btn btn-primary"
                  >
                    {createPermissionMutation.isPending ? 'Creating...' : 'Create Permission'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permission Modal */}
      {showEditModal && selectedPermission && (
        <div className="fixed inset-0 bg-secondary-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-secondary-900">Edit Permission</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={editForm.handleSubmit(handleUpdatePermission)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Action
                  </label>
                  <input
                    {...editForm.register('action', { required: 'Action is required' })}
                    className="input"
                    placeholder="e.g., create, read, update, delete"
                  />
                  {editForm.formState.errors.action && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.formState.errors.action.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Resource
                  </label>
                  <input
                    {...editForm.register('resource', { required: 'Resource is required' })}
                    className="input"
                    placeholder="e.g., users, roles, permissions"
                  />
                  {editForm.formState.errors.resource && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.formState.errors.resource.message}
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
                    placeholder="Describe what this permission allows"
                  />
                  {editForm.formState.errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.formState.errors.description.message}
                    </p>
                  )}
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
                    disabled={updatePermissionMutation.isPending}
                    className="btn btn-primary"
                  >
                    {updatePermissionMutation.isPending ? 'Updating...' : 'Update Permission'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPermission && (
        <div className="fixed inset-0 bg-secondary-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">Delete Permission</h3>
              <p className="text-sm text-secondary-500 mb-4">
                Are you sure you want to delete the permission{' '}
                <strong>{selectedPermission.action}:{selectedPermission.resource}</strong>?{' '}
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
                  onClick={confirmDeletePermission}
                  disabled={deletePermissionMutation.isPending}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                >
                  {deletePermissionMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsPage;
