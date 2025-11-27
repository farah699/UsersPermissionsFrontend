import React from 'react';
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  KeyIcon,
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  const stats = [
    {
      name: 'Total Users',
      value: '12',
      change: '+2 this week',
      icon: UsersIcon,
      color: 'primary'
    },
    {
      name: 'Active Roles',
      value: '5',
      change: 'No changes',
      icon: ShieldCheckIcon,
      color: 'success'
    },
    {
      name: 'Permissions',
      value: '24',
      change: '+3 this month',
      icon: KeyIcon,
      color: 'warning'
    },
    {
      name: 'Recent Activities',
      value: '156',
      change: '+12 today',
      icon: ClipboardDocumentListIcon,
      color: 'secondary'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-secondary-900">Dashboard</h1>
        <p className="mt-1 text-sm text-secondary-600">
          Overview of your users and permissions management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon 
                    className={`h-8 w-8 text-${item.color}-600`}
                    aria-hidden="true" 
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="text-lg font-semibold text-secondary-900">
                      {item.value}
                    </dd>
                    <dd className="text-sm text-secondary-600">
                      {item.change}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-secondary-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <button className="btn btn-primary btn-sm w-full">
                Create New User
              </button>
              <button className="btn btn-secondary btn-sm w-full">
                Assign Role
              </button>
              <button className="btn btn-secondary btn-sm w-full">
                View Audit Logs
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-secondary-900">Your Profile</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-secondary-700">Name</p>
                <p className="text-sm text-secondary-900">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Email</p>
                <p className="text-sm text-secondary-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Roles</p>
                <div className="mt-1 space-x-1">
                  {user?.roles?.map((role) => (
                    <span key={role._id} className="badge badge-primary">
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-secondary-900">Recent Activity</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-secondary-400" />
            <h3 className="mt-2 text-sm font-medium text-secondary-900">No recent activity</h3>
            <p className="mt-1 text-sm text-secondary-500">
              Recent system activities will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
