import { useEffect, useState } from 'react';

import { DashboardLayout } from './DashboardLayout';
import { AlertTriangle, MessageSquare, Send, Megaphone, TrendingUp, Users } from 'lucide-react';
import { AnnouncementModal } from '../modals/AnnouncementModal';
import { api } from '../../lib/api';

export function PoliticianDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('issues');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);

  const [issues, setIssues] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const formatIssue = (issue) => ({
    id: String(issue.id),
    title: issue.title,
    description: issue.description,
    category: issue.category,
    citizen: issue.reporter?.name || 'Citizen',
    status: issue.status.toLowerCase().replace('_', '-'),
    date: issue.createdAt,
    location: issue.location,
    upvotes: issue.upvotes,
    responses: (issue.responses || []).map((response) => ({
      id: String(response.id),
      author: response.authorName,
      content: response.message,
      date: response.createdAt,
    })),
  });

  const formatAnnouncement = (announcement) => ({
    id: String(announcement.id),
    title: announcement.title,
    content: announcement.content,
    date: announcement.createdAt,
    views: 0,
    reactions: 0,
    author: announcement.authorName,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [allIssues, allAnnouncements] = await Promise.all([
          api.issues.all(),
          api.announcements.all(),
        ]);
        setIssues(allIssues.map(formatIssue));
        setAnnouncements(allAnnouncements.map(formatAnnouncement));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const updated = await api.issues.updateStatus(issueId, newStatus);
      setIssues((prev) => prev.map((issue) =>
        issue.id === String(updated.id) ? formatIssue(updated) : issue
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update issue status.');
    }
  };

  const handleAddResponse = async (issueId) => {
    if (!responseText.trim()) return;

    try {
      const updated = await api.issues.addResponse(issueId, {
        message: responseText,
        authorName: user.name,
      });
      setIssues((prev) => prev.map((issue) =>
        issue.id === String(updated.id) ? formatIssue(updated) : issue
      ));
      setResponseText('');
      setSelectedIssue(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add response.');
    }
  };

  const handleCreateAnnouncement = async (announcementData) => {
    setSubmittingAnnouncement(true);
    try {
      const created = await api.announcements.create({
        title: announcementData.title,
        content: announcementData.content,
        category: announcementData.category,
        authorName: user.name,
      });
      setAnnouncements((prev) => [formatAnnouncement(created), ...prev]);
      setShowAnnouncementModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish announcement.');
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { label: 'Pending Issues', value: issues.filter(i => i.status === 'pending').length, icon: AlertTriangle },
    { label: 'In Progress', value: issues.filter(i => i.status === 'in-progress').length, icon: TrendingUp },
    { label: 'Total Responses', value: issues.reduce((acc, i) => acc + i.responses.length, 0), icon: MessageSquare },
    { label: 'Constituents Reached', value: announcements.reduce((acc, a) => acc + a.views, 0), icon: Users },
  ];

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Politician Dashboard</h1>
          <p className="text-gray-600 mt-2">Respond to citizen concerns and share updates</p>
        </div>
        <button
          onClick={() => setShowAnnouncementModal(true)}
          className="px-4 py-2 bg-[#FF9933] text-white rounded-lg hover:bg-[#e8871e] transition-colors flex items-center"
        >
          <Megaphone className="w-5 h-5 mr-2" />
          New Announcement
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
                <Icon className="w-8 h-8 text-[#FF9933]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('issues')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'issues'
              ? 'border-b-2 border-[#FF9933] text-[#FF9933]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Citizen Issues
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'announcements'
              ? 'border-b-2 border-[#FF9933] text-[#FF9933]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Announcements
        </button>
      </div>

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <div className="space-y-6">
          {loading && (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">Loading citizen issues...</div>
          )}
          {!loading && issues.length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">No citizen issues available right now.</div>
          )}
          {issues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{issue.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{issue.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Reported by: {issue.citizen}</span>
                    <span>{issue.category}</span>
                    <span>{issue.location}</span>
                    <span>👍 {issue.upvotes}</span>
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Responses */}
              {issue.responses.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Responses</h4>
                  <div className="space-y-3">
                    {issue.responses.map((response) => (
                      <div key={response.id} className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{response.author}</span>
                          <span className="text-sm text-[#FF9933]">{new Date(response.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700">{response.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Response */}
              {selectedIssue === issue.id ? (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setSelectedIssue(null);
                        setResponseText('');
                      }}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAddResponse(issue.id)}
                      className="px-4 py-2 bg-[#FF9933] text-white rounded-lg hover:bg-[#e8871e] transition-colors flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Response
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedIssue(issue.id)}
                  className="mt-4 px-4 py-2 text-[#FF9933] hover:bg-orange-50 rounded-lg transition-colors flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Response
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {loading && (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">Loading announcements...</div>
          )}
          {!loading && announcements.length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">No announcements published yet.</div>
          )}
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                  <p className="text-gray-600 mb-4">{announcement.content}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>{new Date(announcement.date).toLocaleDateString()}</span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {announcement.views} views
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {announcement.reactions} reactions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAnnouncementModal && (
        <AnnouncementModal
          onClose={() => setShowAnnouncementModal(false)}
          onSubmit={handleCreateAnnouncement}
          isSubmitting={submittingAnnouncement}
        />
      )}
    </DashboardLayout>
  );
}
