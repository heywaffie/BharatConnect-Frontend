import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { AlertTriangle, Send, Megaphone } from 'lucide-react';
import { AnnouncementModal } from '../modals/AnnouncementModal';
import { api } from '../../lib/api';

export function PoliticianDashboard({ user, onLogout }) {
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [issues, setIssues] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const allIssues = await api.issues.all();
      setIssues(Array.isArray(allIssues) ? allIssues : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {loadData();}, []);

  const handleRespond = async () => {
    if (!selectedIssue || !responseText.trim()) return;
    setSubmittingResponse(true);
    try {
      await api.issues.addResponse(selectedIssue.id, {content: responseText, authorName: user.name, authorEmail: user.email});
      setSelectedIssue(null);
      setResponseText('');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleAnnouncement = async (announcementData) => {
    setSubmittingAnnouncement(true);
    try {
      await api.announcements.create({title: announcementData.title, content: announcementData.content, authorName: user.name, authorEmail: user.email});
      setShowAnnouncementModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="bg-white p-8 min-h-screen">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Politician Dashboard</h1>
        <p className="text-2xl text-gray-600 mb-8">Respond to issues and make announcements</p>
        {error && (<div className="mb-8 rounded-lg border-2 border-red-300 bg-red-100 px-6 py-4 text-xl text-red-800">{error}</div>)}
        <div className="mb-12"><button onClick={() => setShowAnnouncementModal(true)} disabled={submittingAnnouncement} className="flex items-center gap-3 px-8 py-4 bg-[#FF9933] text-white text-2xl font-bold rounded-xl hover:bg-[#e8871e] disabled:opacity-50"><Megaphone className="w-8 h-8" />Make Announcement</button></div>
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Issues from Citizens</h2>
        {loading ? (<div className="text-2xl text-gray-500">Loading...</div>) : issues.length === 0 ? (<div className="bg-gray-50 rounded-xl p-8 text-2xl text-gray-600">No issues.</div>) : (<div className="space-y-8">{issues.map((issue) => (<div key={issue.id} className="bg-gray-50 rounded-xl p-8 border-2 border-gray-300"><h3 className="text-3xl font-bold text-gray-900 mb-3">{issue.title}</h3><p className="text-xl text-gray-700 mb-4">{issue.description}</p><div className="flex gap-6 mb-6 text-lg"><span className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 font-bold"><AlertTriangle className="w-5 h-5 inline mr-2" />{String(issue.status).replace('_', ' ').toUpperCase()}</span><span className="font-bold text-gray-700">{issue.category}</span></div>{selectedIssue?.id === issue.id ? (<div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-300"><textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="Write your response..." className="w-full p-4 text-xl border-2 border-gray-300 rounded-lg mb-4 font-normal" rows={5} /><div className="flex gap-4"><button onClick={handleRespond} disabled={submittingResponse || !responseText.trim()} className="px-8 py-3 bg-[#138808] text-white text-xl font-bold rounded-lg hover:bg-[#0f6506] disabled:opacity-50">Send Response</button><button onClick={() => {setSelectedIssue(null); setResponseText('');}} className="px-8 py-3 bg-gray-400 text-white text-xl font-bold rounded-lg hover:bg-gray-500">Cancel</button></div></div>) : (<button onClick={() => setSelectedIssue(issue)} className="px-8 py-4 bg-[#138808] text-white text-2xl font-bold rounded-xl hover:bg-[#0f6506]"><Send className="w-8 h-8 inline mr-3" />Respond</button>)}</div>))}</div>)}
        {showAnnouncementModal && (<AnnouncementModal onClose={() => setShowAnnouncementModal(false)} onSubmit={handleAnnouncement} isSubmitting={submittingAnnouncement} />)}
      </div>
    </DashboardLayout>
  );
}
