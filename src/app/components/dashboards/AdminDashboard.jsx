import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Users, Shield } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminDashboard({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const userList = await api.admin.users(user.email);
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {loadData();}, []);

  const handleToggleStatus = async (userId, newStatus) => {
    setUpdatingUser(userId);
    try {
      const updated = await api.admin.updateUserStatus(userId, newStatus);
      setUsers((prev) => prev.map((u) => u.id === userId ? updated : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleToggleRole = async (userId, newRole) => {
    setUpdatingUser(userId);
    try {
      const updated = await api.admin.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u.id === userId ? updated : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setUpdatingUser(null);
    }
  };

  const stats = [
    { label: 'Total Users', value: String(users.length), icon: Users },
    { label: 'Total Admins', value: String(users.filter((u) => u.role === 'admin').length), icon: Shield },
  ];

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="bg-white p-8 min-h-screen">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-2xl text-gray-600 mb-8">Manage users and system settings</p>
        {error && (<div className="mb-8 rounded-lg border-2 border-red-300 bg-red-100 px-6 py-4 text-xl text-red-800">{error}</div>)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">{stats.map((stat) => {const Icon = stat.icon; return (<div key={stat.label} className="bg-gray-50 rounded-xl p-8 border-2 border-gray-300"><div className="flex items-center gap-4"><Icon className="w-12 h-12 text-[#FF9933]" /><div><p className="text-2xl text-gray-600">{stat.label}</p><p className="text-5xl font-bold text-gray-900">{stat.value}</p></div></div></div>);})}</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-8">All Users</h2>
        {loading ? (<div className="text-2xl text-gray-500">Loading...</div>) : users.length === 0 ? (<div className="bg-gray-50 rounded-xl p-8 text-2xl text-gray-600">No users.</div>) : (<div className="space-y-8">{users.map((u) => (<div key={u.id} className="bg-gray-50 rounded-xl p-8 border-2 border-gray-300"><h3 className="text-3xl font-bold text-gray-900 mb-2">{u.name}</h3><p className="text-xl text-gray-700 mb-4">{u.email}</p><div className="flex gap-6 mb-6 text-lg"><span className="px-4 py-2 rounded-lg bg-blue-100 text-blue-800 font-bold">Role: {u.role}</span><span className={`px-4 py-2 rounded-lg font-bold ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Status: {u.status}</span></div><div className="flex gap-4 flex-wrap"><select value={u.status} onChange={(e) => handleToggleStatus(u.id, e.target.value)} disabled={updatingUser === u.id} className="px-6 py-3 bg-white border-2 border-gray-300 text-xl font-bold rounded-lg cursor-pointer disabled:opacity-50"><option value="active">Active</option><option value="inactive">Inactive</option></select><select value={u.role} onChange={(e) => handleToggleRole(u.id, e.target.value)} disabled={updatingUser === u.id} className="px-6 py-3 bg-white border-2 border-gray-300 text-xl font-bold rounded-lg cursor-pointer disabled:opacity-50"><option value="citizen">Citizen</option><option value="moderator">Moderator</option><option value="politician">Politician</option><option value="admin">Admin</option></select></div></div>))}</div>)}
      </div>
    </DashboardLayout>
  );
}
