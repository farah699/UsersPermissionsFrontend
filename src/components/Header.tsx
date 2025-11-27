import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

const Header: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <header className="page-header">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="page-description">
            Manage your users, roles, and permissions from this dashboard
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-full">
            <BellIcon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-secondary-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-secondary-500">
                {user?.roles?.map(role => role.name).join(', ')}
              </p>
            </div>
            
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
