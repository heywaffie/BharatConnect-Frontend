import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';

export function ModeratorDashboard({ user, onLogout }) {
  const [flaggedIssues, setFlaggedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioning, setActioning] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.issues.all();
      const flagged = (Array.isArray(data) ? data : []).filter((issue) => issue.status && String(issue.status).toLowerCase() !== 'resolved');
      setFlaggedIssues(flagged);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {loadData();}, []);

  const handleApprove = async (issueId) => {
    setActioning(issueId);
    try {
      const updated = await api.issues.updateStatus(issueId, 'in_progress');
      setFlaggedIssues((prev) => prev.map((issue) => issue.id === issueId ? updated : issue));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (issueId) => {
    setActioning(issueId);
    try {
      const updated = await api.issues.updateStatus(issueId, 'rejected');
      setFlaggedIssues((prev) => prev.map((issue) => issue.id === issueId ? updated : issue));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setActioning(null);
    }
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="bg-white p-8 min-h-screen">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Moderator Dashboard</h1>
        <p className="text-2xl text-gray-600 mb-8">Review and approve community issues</p>
        {error && (<div className="mb-8 rounded-lg border-2 border-red-300 bg-red-100 px-6 py-4 text-xl text-red-800">{error}</div>)}
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Issues Awaiting Review</h2>
        {loading ? (<div className="text-2xl text-gray-500">Loading...</div>) : flaggedIssues.length === 0 ? (<div className="bg-gray-50 rounded-xl p-8 text-2xl text-gray-600">No issues to review.</div>) : (<div className="space-y-8">{flaggedIssues.map((issue) => (<div key={issue.id} className="bg-gray-50 rounded-xl p-8 border-2 border-gray-300"><h3 className="text-3xl font-bold text-gray-900 mb-3">{issue.title}</h3><p className="text-xl text-gray-700 mb-4">{issue.description}</p><div className="flex gap-6 mb-6 text-lg"><span className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 font-bold"><AlertTriangle className="w-5 h-5 inline mr-2" />{String(issue.status).replace('_', ' ').toUpperCase()}</span><span className="font-bold text-gray-700">Category: {issue.category}</span><span className="font-bold text-gray-700">{issue.location}</span></div><div className="flex gap-6"><button onClick={() => handleApprove(issue.id)} disabled={actioning === issue.id} className="flex items-center gap-3 px-8 py-4 bg-[#138808] text-white text-2xl font-bold rounded-xl hover:bg-[#0f6506] disabled:opacity-50"><CheckCircle className="w-8 h-8" />Approve</button><button onClick={() => handleReject(issue.id)} disabled={actioning === issue.id} className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white text-2xl font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"><XCircle className="w-8 h-8" />Reject</button></div></div>))}</div>)}
      </div>
    </DashboardLayout>
  );
}
