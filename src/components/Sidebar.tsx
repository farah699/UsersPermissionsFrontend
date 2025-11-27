import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  KeyIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import { clsx } from 'clsx';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Users',
      href: '/users',
      icon: UsersIcon,
      permission: 'user:read'
    },
    {
      name: 'Roles',
      href: '/roles',
      icon: ShieldCheckIcon,
      permission: 'role:read'
    },
    {
      name: 'Permissions',
      href: '/permissions',
      icon: KeyIcon,
      permission: 'permission:read'
    },
    {
      name: 'Audit Logs',
      href: '/audit',
      icon: ClipboardDocumentListIcon,
      permission: 'audit:read'
    },
  ];

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.roles) return false;
    
    return user.roles.some(role => 
      role.permissions.some(p => {
        const permissionKey = `${p.resource}:${p.action}`;
        return permissionKey === permission || p.action === 'manage';
      })
    );
  };

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="sidebar">
      <div className="flex h-16 items-center justify-center border-b border-secondary-200">
        <h1 className="text-xl font-semibold text-primary-600">
          OpusLab RBAC
        </h1>
      </div>

      <nav className="mt-8 flex-1 space-y-1 px-4">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'sidebar-item',
                isActive && 'active'
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-secondary-200 p-4">
        <div className="mb-4">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              clsx(
                'sidebar-item mb-2',
                isActive && 'active'
              )
            }
          >
            <UserIcon className="mr-3 h-5 w-5" />
            Profile
          </NavLink>
          
          <div className="mb-2 px-4 py-2">
            <p className="text-sm font-medium text-secondary-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-secondary-500">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-left text-danger-600 hover:bg-danger-50 hover:text-danger-700"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
