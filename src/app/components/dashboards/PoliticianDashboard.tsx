import { useState } from 'react';
import type { User } from '../../types';
import { DashboardLayout } from './DashboardLayout';
import { AlertTriangle, MessageSquare, Send, Megaphone, TrendingUp, Users } from 'lucide-react';
import { AnnouncementModal } from '../modals/AnnouncementModal';

interface PoliticianDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  citizen: string;
  status: 'pending' | 'in-progress' | 'resolved';
  date: string;
  location: string;
  upvotes: number;
  responses: Response[];
}

interface Response {
  id: string;
  author: string;
  content: string;
  date: string;
}

export function PoliticianDashboard({ user, onLogout }: PoliticianDashboardProps) {
  const [activeTab, setActiveTab] = useState<'issues' | 'announcements'>('issues');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const [issues, setIssues] = useState<Issue[]>([
    {
      id: '1',
      title: 'Broken streetlight on Main Street',
      description: 'The streetlight near the park has been out for 2 weeks',
      category: 'Infrastructure',
      citizen: 'John Doe',
      status: 'in-progress',
      date: '2024-02-15',
      location: 'Main Street & Park Ave',
      upvotes: 24,
      responses: [
        {
          id: 'r1',
          author: 'Mayor Johnson',
          content: 'Thank you for reporting this. We have contacted the maintenance team and they will fix it by end of week.',
          date: '2024-02-16',
        },
      ],
    },
    {
      id: '2',
      title: 'Pothole on Highway 101',
      description: 'Large pothole causing traffic issues',
      category: 'Roads',
      citizen: 'Sarah Smith',
      status: 'pending',
      date: '2024-02-20',
      location: 'Highway 101, Mile 15',
      upvotes: 45,
      responses: [],
    },
    {
      id: '3',
      title: 'Need more public parking downtown',
      description: 'Downtown area needs additional parking facilities',
      category: 'Transportation',
      citizen: 'Mike Johnson',
      status: 'pending',
      date: '2024-02-19',
      location: 'Downtown District',
      upvotes: 67,
      responses: [],
    },
    {
      id: '4',
      title: 'Park maintenance needed',
      description: 'Playground equipment needs repairs',
      category: 'Parks',
      citizen: 'Emily Davis',
      status: 'resolved',
      date: '2024-01-28',
      location: 'Central Park',
      upvotes: 18,
      responses: [
        {
          id: 'r2',
          author: 'Council Member Smith',
          content: 'The playground equipment has been repaired. Thank you for bringing this to our attention.',
          date: '2024-02-05',
        },
      ],
    },
  ]);

  const [announcements] = useState([
    {
      id: '1',
      title: 'New Community Center Opening',
      content: 'We are excited to announce the opening of the new community center on March 15th.',
      date: '2024-02-20',
      views: 234,
      reactions: 45,
    },
    {
      id: '2',
      title: 'Road Improvement Project Update',
      content: 'The road improvement project on Highway 101 is progressing well.',
      date: '2024-02-18',
      views: 189,
      reactions: 32,
    },
  ]);

  const handleStatusChange = (issueId: string, newStatus: 'pending' | 'in-progress' | 'resolved') => {
    setIssues(issues.map(issue =>
      issue.id === issueId ? { ...issue, status: newStatus } : issue
    ));
  };

  const handleAddResponse = (issueId: string) => {
    if (!responseText.trim()) return;

    const newResponse: Response = {
      id: Math.random().toString(36).substr(2, 9),
      author: user.name,
      content: responseText,
      date: new Date().toISOString().split('T')[0],
    };

    setIssues(issues.map(issue =>
      issue.id === issueId
        ? { ...issue, responses: [...issue.responses, newResponse] }
        : issue
    ));

    setResponseText('');
    setSelectedIssue(null);
  };

  const getStatusColor = (status: string) => {
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
                    onChange={(e) => handleStatusChange(issue.id, e.target.value as any)}
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
        <AnnouncementModal onClose={() => setShowAnnouncementModal(false)} />
      )}
    </DashboardLayout>
  );
}
