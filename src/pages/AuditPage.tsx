import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UserIcon,
  ShieldCheckIcon,
  KeyIcon,
  ComputerDesktopIcon,
  ClockIcon,
  FunnelIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { auditApi } from '../services/api';
import { AuditLog } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  pages: number;
}

const AuditPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const limit = 15;

  // Fetch audit logs
  const { data: auditData, isLoading, error } = useQuery<AuditLogsResponse>({
    queryKey: ['audit-logs', page, search, filterAction, filterResource, dateRange],
    queryFn: async () => {
      const response = await auditApi.getAuditLogs({
        page,
        limit,
        search: search || undefined,
        action: filterAction || undefined,
        resource: filterResource || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined
      });
      return response.data;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterAction('');
    setFilterResource('');
    setDateRange({ startDate: '', endDate: '' });
    setPage(1);
  };

  const exportLogs = async () => {
    try {
      const blob = await auditApi.exportLogs({
        search: search || undefined,
        action: filterAction || undefined,
        resource: filterResource || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return <UserIcon className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <UserIcon className="h-4 w-4 text-secondary-500" />;
      case 'create':
        return <ShieldCheckIcon className="h-4 w-4 text-blue-500" />;
      case 'update':
        return <ShieldCheckIcon className="h-4 w-4 text-yellow-500" />;
      case 'delete':
        return <ShieldCheckIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-secondary-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-secondary-100 text-secondary-800';
      case 'create':
        return 'bg-blue-100 text-blue-800';
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const totalPages = auditData?.pages || 0;

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error loading audit logs</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-secondary-600">
            View system activity and audit trails
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>
          <button
            onClick={exportLogs}
            className="btn btn-outline"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by user, action, or resource..."
                    className="input pl-10"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400 absolute left-3 top-3" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Action
                </label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="input"
                >
                  <option value="">All Actions</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Resource
                </label>
                <select
                  value={filterResource}
                  onChange={(e) => setFilterResource(e.target.value)}
                  className="input"
                >
                  <option value="">All Resources</option>
                  <option value="users">Users</option>
                  <option value="roles">Roles</option>
                  <option value="permissions">Permissions</option>
                  <option value="auth">Authentication</option>
                </select>
              </div>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-secondary-200">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary">
                  Apply Filters
                </button>
                {(search || filterAction || filterResource || dateRange.startDate || dateRange.endDate) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn btn-outline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <p className="text-sm text-secondary-600">
                {auditData?.total || 0} total entries
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {auditData?.logs && Array.isArray(auditData.logs) ? auditData.logs.map((log) => {
                  const { date, time } = formatDateTime(log.createdAt);
                  return (
                    <tr key={log._id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">{date}</div>
                        <div className="text-xs text-secondary-500">{time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
                            {typeof log.userId === 'object' ? (
                              <span className="text-xs font-medium text-primary-800">
                                {log.userId.firstName?.charAt(0)}{log.userId.lastName?.charAt(0)}
                              </span>
                            ) : (
                              <UserIcon className="h-4 w-4 text-primary-600" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-secondary-900">
                              {typeof log.userId === 'object' 
                                ? `${log.userId.firstName} ${log.userId.lastName}`
                                : 'Unknown User'
                              }
                            </div>
                            <div className="text-xs text-secondary-500">{log.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getActionIcon(log.action)}
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">{log.resource}</div>
                        {log.resourceId && (
                          <div className="text-xs text-secondary-500">ID: {log.resourceId.slice(-8)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ComputerDesktopIcon className="h-4 w-4 text-secondary-400 mr-1" />
                          <span className="text-sm text-secondary-900">{log.ipAddress || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-secondary-900 max-w-xs">
                          {log.changes && Object.keys(log.changes).length > 0 && (
                            <div className="mb-1">
                              <span className="font-medium">Changes:</span>
                              <div className="text-xs text-secondary-600">
                                {Object.entries(log.changes).map(([key, value]) => (
                                  <div key={key}>
                                    {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="text-xs text-secondary-500">
                              {Object.entries(log.metadata).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                          {log.userAgent && (
                            <div className="text-xs text-secondary-400 truncate" title={log.userAgent}>
                              {log.userAgent.split(' ')[0]}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-secondary-500">
                      No audit logs available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {auditData?.logs && auditData.logs.length === 0 && (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-secondary-400" />
              <h3 className="mt-2 text-sm font-medium text-secondary-900">No audit logs found</h3>
              <p className="mt-1 text-sm text-secondary-500">
                No activity matches your current filters.
              </p>
            </div>
          )}

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
                      {Math.min(page * limit, auditData?.total || 0)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{auditData?.total || 0}</span>{' '}
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
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 7) {
                        if (page <= 4) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 3) {
                          pageNum = totalPages - 6 + i;
                        } else {
                          pageNum = page - 3 + i;
                        }
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pageNum
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-secondary-300 text-secondary-500 hover:bg-secondary-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
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
    </div>
  );
};

export default AuditPage;
