import React from 'react';
import { useAuthStore } from '../store/authStore';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-secondary-900">Profile</h1>
        <p className="mt-1 text-sm text-secondary-600">
          View and manage your profile information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-secondary-900">Personal Information</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700">First Name</label>
                <p className="mt-1 text-sm text-secondary-900">{user?.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Last Name</label>
                <p className="mt-1 text-sm text-secondary-900">{user?.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Email</label>
                <p className="mt-1 text-sm text-secondary-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Status</label>
                <span className={`badge ${user?.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-secondary-900">Roles & Permissions</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700">Assigned Roles</label>
                <div className="mt-2 space-x-2">
                  {user?.roles?.map((role: any) => (
                    <span key={role._id} className="badge badge-primary">
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700">Account Created</label>
                <p className="mt-1 text-sm text-secondary-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700">Last Updated</label>
                <p className="mt-1 text-sm text-secondary-900">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-secondary-900">Change Password</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-secondary-900">Password Management</h3>
            <p className="mt-1 text-sm text-secondary-500">
              Password change functionality will be implemented here.
            </p>
            <button className="mt-4 btn btn-primary btn-sm">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
