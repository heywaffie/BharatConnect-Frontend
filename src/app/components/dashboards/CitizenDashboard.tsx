import { useState } from 'react';
import type { User } from '../../types';
import { DashboardLayout } from './DashboardLayout';
import { Plus, MessageSquare, CheckCircle, Clock, AlertTriangle, Megaphone } from 'lucide-react';
import { IssueReportModal } from '../modals/IssueReportModal';
import { FeedbackModal } from '../modals/FeedbackModal';

interface CitizenDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved';
  date: string;
  location: string;
  upvotes: number;
}

interface Update {
  id: string;
  politician: string;
  title: string;
  content: string;
  date: string;
  image?: string;
}

export function CitizenDashboard({ user, onLogout }: CitizenDashboardProps) {
  const [activeTab, setActiveTab] = useState<'my-issues' | 'updates' | 'feedback'>('my-issues');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [issues, setIssues] = useState<Issue[]>([
    {
      id: '1',
      title: 'Broken streetlight on Main Street',
      description: 'The streetlight near the park has been out for 2 weeks',
      category: 'Infrastructure',
      status: 'in-progress',
      date: '2024-02-15',
      location: 'Main Street & Park Ave',
      upvotes: 24,
    },
    {
      id: '2',
      title: 'Pothole on Highway 101',
      description: 'Large pothole causing traffic issues',
      category: 'Roads',
      status: 'pending',
      date: '2024-02-20',
      location: 'Highway 101, Mile 15',
      upvotes: 45,
    },
    {
      id: '3',
      title: 'Park maintenance needed',
      description: 'Playground equipment needs repairs',
      category: 'Parks',
      status: 'resolved',
      date: '2024-01-28',
      location: 'Central Park',
      upvotes: 18,
    },
  ]);

  const updates: Update[] = [
    {
      id: '1',
      politician: 'Mayor Johnson',
      title: 'New Community Center Opening',
      content: 'We are excited to announce the opening of the new community center on March 15th. This facility will serve as a hub for local events and activities.',
      date: '2024-02-20',
    },
    {
      id: '2',
      politician: 'Council Member Smith',
      title: 'Road Improvement Project Update',
      content: 'The road improvement project on Highway 101 is progressing well. We expect completion by end of March.',
      date: '2024-02-18',
    },
    {
      id: '3',
      politician: 'Mayor Johnson',
      title: 'Town Hall Meeting Scheduled',
      content: 'Join us for our quarterly town hall meeting on March 1st at 7 PM. We will discuss upcoming projects and answer your questions.',
      date: '2024-02-15',
    },
  ];

  const handleIssueSubmit = (issueData: Omit<Issue, 'id' | 'date' | 'upvotes'>) => {
    const newIssue: Issue = {
      ...issueData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      upvotes: 0,
    };
    setIssues([newIssue, ...issues]);
    setShowIssueModal(false);
  };

  const handleUpvote = (issueId: string) => {
    setIssues(issues.map(issue =>
      issue.id === issueId
        ? { ...issue, upvotes: issue.upvotes + 1 }
        : issue
    ));
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'in-progress':
        return AlertTriangle;
      case 'resolved':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Citizen Dashboard</h1>
          <p className="text-gray-600 mt-2">Report issues and stay connected with your representatives</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="px-4 py-2 bg-[#138808] text-white rounded-lg hover:bg-[#0f6506] transition-colors flex items-center"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Give Feedback
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="px-4 py-2 bg-[#FF9933] text-white rounded-lg hover:bg-[#e8871e] transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('my-issues')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'my-issues'
              ? 'border-b-2 border-[#FF9933] text-[#FF9933]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Issues
        </button>
        <button
          onClick={() => setActiveTab('updates')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'updates'
              ? 'border-b-2 border-[#FF9933] text-[#FF9933]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Updates & Announcements
        </button>
      </div>

      {/* My Issues Tab */}
      {activeTab === 'my-issues' && (
        <div className="space-y-4">
          {issues.map((issue) => {
            const StatusIcon = getStatusIcon(issue.status);
            return (
              <div key={issue.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{issue.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)} flex items-center`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {issue.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{issue.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {issue.category}
                      </span>
                      <span>{issue.location}</span>
                      <span>{new Date(issue.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpvote(issue.id)}
                    className="ml-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex flex-col items-center transition-colors"
                  >
                    <span className="text-2xl">👍</span>
                    <span className="text-sm font-medium text-gray-700">{issue.upvotes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Updates Tab */}
      {activeTab === 'updates' && (
        <div className="space-y-6">
          {updates.map((update) => (
            <div key={update.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-6 h-6 text-[#FF9933]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{update.title}</h3>
                      <p className="text-sm text-gray-500">by {update.politician}</p>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(update.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mt-3">{update.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showIssueModal && (
        <IssueReportModal
          onClose={() => setShowIssueModal(false)}
          onSubmit={handleIssueSubmit}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </DashboardLayout>
  );
}
