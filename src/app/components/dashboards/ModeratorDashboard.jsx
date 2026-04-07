import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { DashboardLayout } from './DashboardLayout';
import { Flag, CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../lib/api';

export function ModeratorDashboard({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('flagged');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.issues.all();
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load moderation queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('quick') !== 'queue') return;

    setActiveTab('flagged');
    params.delete('quick');
    const search = params.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : '' }, { replace: true });
  }, [location.pathname, location.search, navigate]);

  const moderationQueue = useMemo(
    () => issues.filter((issue) => issue.status !== 'resolved'),
    [issues],
  );

  const activityLog = useMemo(() => {
    const entries = issues.flatMap((issue) =>
      (issue.responses || []).map((response) => ({
        id: `${issue.id}-${response.createdAt}`,
        action: 'Response added',
        moderator: response.authorName,
        target: issue.title,
        time: response.createdAt,
      })),
    );

    return entries
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 25);
  }, [issues]);

  const handleContentAction = async (issueId, action) => {
    const status = action === 'approve' ? 'in-progress' : 'resolved';
    try {
      await api.issues.updateStatus(issueId, status);
      await loadIssues();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update issue status.');
    }
  };

  const stats = [
    { label: 'Pending Review', value: issues.filter((i) => i.status === 'pending').length, icon: Flag, color: 'bg-yellow-500' },
    { label: 'In Progress', value: issues.filter((i) => i.status === 'in-progress').length, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Resolved', value: issues.filter((i) => i.status === 'resolved').length, icon: XCircle, color: 'bg-red-500' },
    { label: 'Total Actions', value: activityLog.length, icon: Eye, color: 'bg-blue-500' },
  ];

  const locale = { EN: 'en-IN', HI: 'hi-IN', TE: 'te-IN', TA: 'ta-IN' }[lang] || 'en-IN';
  const formatDate = (value) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
  const formatDateTime = (value) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Moderator Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor interactions and ensure respectful communication</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
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

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('flagged')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'flagged'
              ? 'border-b-2 border-[#FF9933] text-[#FF9933]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Flagged Content
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'activity'
              ? 'border-b-2 border-[#FF9933] text-[#FF9933]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Activity Log
        </button>
      </div>

      {/* Flagged Content Tab */}
      {activeTab === 'flagged' && (
        <div className="space-y-6">
          {loading && (
            <LoadingSkeleton lines={4} className="text-sm text-gray-500" />
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center justify-between gap-3">
              <span>{error}</span>
              <button onClick={loadIssues} className="px-3 py-1.5 rounded bg-red-100 hover:bg-red-200 text-red-800 font-semibold text-xs">Retry</button>
            </div>
          )}

          {!loading && !error && moderationQueue.length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-500">No issues currently need moderation review.</div>
          )}

          {moderationQueue.map((issue) => (
            <div key={issue.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      issue
                    </span>
                    {issue.status !== 'pending' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        issue.status === 'in-progress' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {issue.status}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{issue.title}</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-gray-700">{issue.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Author:</span>
                      <span className="ml-2 text-gray-900 font-medium">{issue.reporter?.name || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reporter:</span>
                      <span className="ml-2 text-gray-900 font-medium">{issue.reporter?.email || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 text-red-600 font-medium flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {issue.category || 'General'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-2 text-gray-900 font-medium">{formatDate(issue.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {issue.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleContentAction(issue.id, 'remove')}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleContentAction(issue.id, 'approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept For Work
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Activity Log Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold flex items-center">
              <Eye className="w-5 h-5 mr-2 text-green-600" />
              Recent Moderation Activity
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activityLog.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">
                        By {activity.moderator} • {activity.target}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{formatDateTime(activity.time)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
