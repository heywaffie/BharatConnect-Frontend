import { useEffect, useState } from 'react';

import { DashboardLayout } from './DashboardLayout';
import { Plus, MessageSquare, CheckCircle, Clock, AlertTriangle, Megaphone } from 'lucide-react';
import { IssueReportModal } from '../modals/IssueReportModal';
import { FeedbackModal } from '../modals/FeedbackModal';
import { api } from '../../lib/api';

export function CitizenDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('my-issues');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const [issues, setIssues] = useState([]);
  const [updates, setUpdates] = useState([]);

  const formatIssue = (issue) => ({
    id: String(issue.id),
    title: issue.title,
    description: issue.description,
    category: issue.category,
    status: issue.status.toLowerCase().replace('_', '-'),
    date: issue.createdAt,
    location: issue.location,
    upvotes: issue.upvotes,
  });

  const formatAnnouncement = (announcement) => ({
    id: String(announcement.id),
    politician: announcement.authorName,
    title: announcement.title,
    content: announcement.content,
    date: announcement.createdAt,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [myIssues, announcements] = await Promise.all([
          api.issues.mine(user.email),
          api.announcements.all(),
        ]);
        setIssues(myIssues.map(formatIssue));
        setUpdates(announcements.map(formatAnnouncement));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.email]);

  const handleIssueSubmit = async (issueData) => {
    setSubmittingIssue(true);
    try {
      const created = await api.issues.create({
        title: issueData.title,
        description: issueData.description,
        category: issueData.category,
        location: issueData.location,
        reporterEmail: user.email,
      });
      setIssues((prev) => [formatIssue(created), ...prev]);
      setShowIssueModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit issue.');
    } finally {
      setSubmittingIssue(false);
    }
  };

  const handleUpvote = async (issueId) => {
    try {
      const updated = await api.issues.upvote(issueId);
      setIssues((prev) => prev.map((issue) =>
        issue.id === String(updated.id) ? formatIssue(updated) : issue
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upvote issue.');
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    setSubmittingFeedback(true);
    try {
      await api.feedback.create({
        rating: feedbackData.rating,
        feedback: feedbackData.feedback,
        category: feedbackData.category,
        authorName: user.name,
        email: user.email,
      });
      setShowFeedbackModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
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

  const getStatusIcon = (status) => {
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
            className="px-4 py-2 bg-[#FF9933] text-white rounded-lg hover:bg-[#e8871e] transition-colors flex items-center disabled:opacity-60"
            disabled={submittingIssue}
          >
            <Plus className="w-5 h-5 mr-2" />
            Report Issue
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
          {loading && (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">Loading your issues...</div>
          )}
          {!loading && issues.length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">No issues yet. Report your first issue.</div>
          )}
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
          {loading && (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">Loading announcements...</div>
          )}
          {!loading && updates.length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-gray-600">No announcements available yet.</div>
          )}
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
          isSubmitting={submittingIssue}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleFeedbackSubmit}
          isSubmitting={submittingFeedback}
        />
      )}
    </DashboardLayout>
  );
}
