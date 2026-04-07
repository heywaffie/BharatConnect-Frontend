import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { DashboardLayout } from './DashboardLayout';
import { Users, Shield, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { api } from '../../lib/api';

export function AdminDashboard({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [userList, issueList] = await Promise.all([api.admin.users(user.email), api.issues.all()]);
      setUsers(Array.isArray(userList) ? userList : []);
      setIssues(Array.isArray(issueList) ? issueList : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('quick') !== 'users') return;

    setActiveTab('users');
    params.delete('quick');
    const search = params.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true });
  }, [location.pathname, location.search, navigate]);

  const stats = useMemo(() => [
    { label: 'Total Users', value: String(users.length), icon: Users, color: 'bg-blue-500' },
    { label: 'Active Issues', value: String(issues.filter((i) => String(i.status || '').toLowerCase() !== 'resolved').length), icon: AlertTriangle, color: 'bg-yellow-500' },
    { label: 'Resolved Issues', value: String(issues.filter((i) => String(i.status || '').toLowerCase() === 'resolved').length), icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Suspended Users', value: String(users.filter((u) => String(u.status || '').toLowerCase() === 'suspended').length), icon: XCircle, color: 'bg-red-500' },
  ], [issues, users]);

  const usersByRole = useMemo(() => {
    const counts = users.reduce((acc, current) => {
      acc[current.role] = (acc[current.role] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Citizens', value: counts.citizen || counts.CITIZEN || 0, color: '#FF9933' },
      { name: 'Politicians', value: counts.politician || counts.POLITICIAN || 0, color: '#138808' },
      { name: 'Moderators', value: counts.moderator || counts.MODERATOR || 0, color: '#10B981' },
      { name: 'Admins', value: counts.admin || counts.ADMIN || 0, color: '#EF4444' },
    ];
  }, [users]);

  const issuesTrend = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = date.toLocaleString(undefined, { month: 'short' });
      const month = date.getMonth();
      const year = date.getFullYear();

      const reported = issues.filter((issue) => {
        const issueDate = new Date(issue.createdAt);
        return issueDate.getMonth() === month && issueDate.getFullYear() === year;
      }).length;

      const resolved = issues.filter((issue) => {
        const issueDate = new Date(issue.createdAt);
        return String(issue.status || '').toLowerCase() === 'resolved' && issueDate.getMonth() === month && issueDate.getFullYear() === year;
      }).length;

      months.push({ month: monthLabel, reported, resolved });
    }
    return months;
  }, [issues]);

  const recentActivity = useMemo(() => {
    const entries = issues.slice(0, 8).map((issue) => ({
      id: issue.id,
      action: String(issue.status || '').toLowerCase() === 'resolved' ? 'Issue resolved' : 'Issue reported',
      user: issue.reporter?.name || 'Unknown user',
      time: issue.createdAt,
      type: String(issue.status || '').toLowerCase() === 'resolved' ? 'issue-resolved' : 'issue-reported',
    }));

    return entries.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [issues]);

  const toggleUserStatus = async (userId, status) => {
    try {
      const nextStatus = status === 'active' ? 'suspended' : 'active';
      await api.admin.updateUserStatus(userId, nextStatus, user.email);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status.');
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await api.admin.updateUserRole(userId, role, user.email);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role.');
    }
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage platform operations and monitor system health</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'border-b-2 border-[#FF9933] text-[#FF9933]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'users'
              ? 'border-b-2 border-[#FF9933] text-[#FF9933]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'border-b-2 border-[#FF9933] text-[#FF9933]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {loading && <LoadingSkeleton lines={4} className="text-sm text-gray-500" />}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center justify-between gap-3">
              <span>{error}</span>
              <button onClick={loadData} className="px-3 py-1.5 rounded bg-red-100 hover:bg-red-200 text-red-800 font-semibold text-xs">Retry</button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="cc-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="cc-card p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#FF9933]" />
              Recent Platform Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      activity.type === 'issue-reported' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.user}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(activity.time).toLocaleString()}</span>
                </div>
              ))}
              {recentActivity.length === 0 && <p className="text-sm text-gray-500">No activity available yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="cc-card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold">User Management</h3>
            <p className="text-sm text-gray-600 mt-1">Manage user accounts and permissions</p>
          </div>
          <div className="md:hidden divide-y divide-gray-100">
            {users.map((userData) => {
              const role = String(userData.role || '').toLowerCase();
              const status = String(userData.status || '').toLowerCase();
              const isFixedAdmin = String(userData.email || '').toLowerCase() === 'ashokvibes@gmail.com';

              return (
                <div key={`mobile-${userData.id}`} className="p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900 leading-tight">{userData.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{userData.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-full font-medium ${
                      role === 'politician' ? 'bg-green-100 text-[#138808]' :
                      role === 'moderator' ? 'bg-green-100 text-green-800' :
                      role === 'admin' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {role}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full font-medium ${
                      status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status}
                    </span>
                    <span className="text-gray-500">Joined {new Date(userData.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!isFixedAdmin && (
                      <select
                        value={role}
                        onChange={(e) => updateUserRole(userData.id, e.target.value)}
                        className="flex-1 min-w-[160px] px-2.5 py-2 border border-gray-200 rounded text-sm"
                      >
                        <option value="citizen">citizen</option>
                        <option value="moderator">moderator</option>
                        <option value="politician">politician</option>
                      </select>
                    )}
                    <button
                      onClick={() => toggleUserStatus(userData.id, status)}
                      disabled={isFixedAdmin}
                      className={`px-3 py-2 rounded text-sm font-medium ${
                        status === 'active'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })}
            {users.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-gray-500">No users found yet.</div>
            )}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userData) => {
                  const role = String(userData.role || '').toLowerCase();
                  const status = String(userData.status || '').toLowerCase();
                  const isFixedAdmin = String(userData.email || '').toLowerCase() === 'ashokvibes@gmail.com';

                  return (
                  <tr key={userData.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{userData.name}</div>
                        <div className="text-sm text-gray-500">{userData.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        role === 'politician' ? 'bg-green-100 text-[#138808]' :
                        role === 'moderator' ? 'bg-green-100 text-green-800' :
                        role === 'admin' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {!isFixedAdmin && (
                          <select
                            value={role}
                            onChange={(e) => updateUserRole(userData.id, e.target.value)}
                            className="px-2 py-1 border border-gray-200 rounded text-xs"
                          >
                            <option value="citizen">citizen</option>
                            <option value="moderator">moderator</option>
                            <option value="politician">politician</option>
                          </select>
                        )}
                        <button
                          onClick={() => toggleUserStatus(userData.id, status)}
                          disabled={isFixedAdmin}
                          className={`px-4 py-2 rounded ${
                            status === 'active'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );})}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                      No users found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Users by Role */}
            <div className="cc-card p-6">
              <h3 className="text-xl font-semibold mb-6">Users by Role</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usersByRole}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Issues Trend */}
            <div className="cc-card p-6">
              <h3 className="text-xl font-semibold mb-6">Issues Trend (6 Months)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={issuesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reported" fill="#3B82F6" name="Reported" />
                  <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
