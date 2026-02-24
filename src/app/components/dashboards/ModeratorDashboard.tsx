import { useState } from 'react';
import type { User } from '../../types';
import { DashboardLayout } from './DashboardLayout';
import { Flag, CheckCircle, XCircle, Eye, MessageSquare, AlertTriangle } from 'lucide-react';

interface ModeratorDashboardProps {
  user: User;
  onLogout: () => void;
}

interface FlaggedContent {
  id: string;
  type: 'issue' | 'comment' | 'announcement';
  title: string;
  content: string;
  author: string;
  reporter: string;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'removed';
}

export function ModeratorDashboard({ user, onLogout }: ModeratorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'flagged' | 'activity'>('flagged');

  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([
    {
      id: '1',
      type: 'comment',
      title: 'Response to: Broken streetlight',
      content: 'This is taking way too long to fix! Completely unacceptable service.',
      author: 'Anonymous User',
      reporter: 'John Doe',
      reason: 'Inappropriate language',
      date: '2024-02-21',
      status: 'pending',
    },
    {
      id: '2',
      type: 'issue',
      title: 'Noise complaint',
      content: 'Excessive noise from construction site at night.',
      author: 'Sarah Smith',
      reporter: 'Mike Johnson',
      reason: 'Spam / Duplicate',
      date: '2024-02-20',
      status: 'pending',
    },
    {
      id: '3',
      type: 'comment',
      title: 'Response to: Road improvement',
      content: 'Great work on the road improvements!',
      author: 'Emily Davis',
      reporter: 'False Report',
      reason: 'False report',
      date: '2024-02-19',
      status: 'approved',
    },
  ]);

  const activityLog = [
    { id: '1', action: 'Content approved', moderator: user.name, target: 'Comment on Issue #45', time: '10 minutes ago' },
    { id: '2', action: 'Content removed', moderator: user.name, target: 'Comment on Issue #38', time: '1 hour ago' },
    { id: '3', action: 'User warned', moderator: 'Jane Moderator', target: 'User: BadActor123', time: '2 hours ago' },
    { id: '4', action: 'Content approved', moderator: 'Jane Moderator', target: 'Announcement #12', time: '3 hours ago' },
    { id: '5', action: 'Content flagged', moderator: 'Auto-system', target: 'Issue #89', time: '4 hours ago' },
  ];

  const handleContentAction = (contentId: string, action: 'approve' | 'remove') => {
    setFlaggedContent(flaggedContent.map(content =>
      content.id === contentId
        ? { ...content, status: action === 'approve' ? 'approved' : 'removed' }
        : content
    ));
  };

  const stats = [
    { label: 'Pending Review', value: flaggedContent.filter(c => c.status === 'pending').length, icon: Flag, color: 'bg-yellow-500' },
    { label: 'Approved Today', value: flaggedContent.filter(c => c.status === 'approved').length, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Removed Today', value: flaggedContent.filter(c => c.status === 'removed').length, icon: XCircle, color: 'bg-red-500' },
    { label: 'Total Actions', value: activityLog.length, icon: Eye, color: 'bg-blue-500' },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'issue':
        return 'bg-blue-100 text-blue-800';
      case 'comment':
        return 'bg-orange-100 text-[#FF9933]';
      case 'announcement':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          {flaggedContent.map((content) => (
            <div key={content.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(content.type)}`}>
                      {content.type}
                    </span>
                    {content.status !== 'pending' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        content.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {content.status}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-gray-700">{content.content}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Author:</span>
                      <span className="ml-2 text-gray-900 font-medium">{content.author}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reporter:</span>
                      <span className="ml-2 text-gray-900 font-medium">{content.reporter}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reason:</span>
                      <span className="ml-2 text-red-600 font-medium flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {content.reason}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-2 text-gray-900 font-medium">{new Date(content.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {content.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleContentAction(content.id, 'remove')}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Remove Content
                  </button>
                  <button
                    onClick={() => handleContentAction(content.id, 'approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Content
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
                    <div className={`w-2 h-2 rounded-full ${
                      activity.action.includes('approved') ? 'bg-green-500' :
                      activity.action.includes('removed') ? 'bg-red-500' :
                      activity.action.includes('warned') ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">
                        By {activity.moderator} • {activity.target}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
