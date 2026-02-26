import { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext(null)

const SEED_ISSUES = [
  { id: 'i1', title: 'Broken streetlights on Elm Ave', category: 'Infrastructure', description: 'Several streetlights on Elm Avenue have been non-functional for 3 weeks posing safety risks at night.', status: 'open', priority: 'high', authorId: 'u1', authorName: 'Alice Chen', createdAt: '2026-02-10', responses: [], votes: 14, flagged: false },
  { id: 'i2', title: 'Overcrowded public school classrooms', category: 'Education', description: 'Classes at Lincoln Elementary are averaging 38 students per teacher, well above the recommended limit.', status: 'in-progress', priority: 'high', authorId: 'u1', authorName: 'Alice Chen', createdAt: '2026-02-05', responses: [{ id: 'r1', authorId: 'u2', authorName: 'Sen. James Ward', text: 'Thank you for raising this. We are working with the school board to address overcrowding by next semester.', createdAt: '2026-02-08' }], votes: 31, flagged: false },
  { id: 'i3', title: 'Pothole damage on Main Street', category: 'Roads', description: 'Large potholes near the intersection of Main and 5th have damaged multiple vehicles.', status: 'resolved', priority: 'medium', authorId: 'u1', authorName: 'Alice Chen', createdAt: '2026-01-20', responses: [{ id: 'r2', authorId: 'u2', authorName: 'Sen. James Ward', text: 'Repairs have been scheduled and completed. Thank you for reporting.', createdAt: '2026-01-28' }], votes: 8, flagged: false },
  { id: 'i4', title: 'Lack of recycling bins in the park', category: 'Environment', description: 'Riverside Park has no recycling facilities leading to increased littering.', status: 'open', priority: 'low', authorId: 'u1', authorName: 'Citizen User', createdAt: '2026-02-18', responses: [], votes: 5, flagged: false },
  { id: 'i5', title: 'Public transit delays on Route 12', category: 'Transport', description: 'Route 12 buses have been consistently 20–30 minutes late impacting commuters.', status: 'open', priority: 'medium', authorId: 'u1', authorName: 'Citizen User', createdAt: '2026-02-20', responses: [], votes: 22, flagged: false },
]

const SEED_UPDATES = [
  { id: 'up1', title: 'Budget Allocation for Infrastructure', content: 'We are pleased to announce that $2.4M has been allocated for road repairs and streetlight upgrades across District 4. Work begins next month.', authorId: 'u2', authorName: 'Sen. James Ward', createdAt: '2026-02-15', category: 'Infrastructure', likes: 45, comments: [] },
  { id: 'up2', title: 'Town Hall Meeting — March 5th', content: 'Join us for an open town hall at Community Center, 6 PM on March 5th. Bring your questions and concerns. All residents welcome.', authorId: 'u2', authorName: 'Sen. James Ward', createdAt: '2026-02-12', category: 'Community', likes: 62, comments: [] },
  { id: 'up3', title: 'New Park Facilities Approved', content: 'The city council has approved the installation of new playground equipment, benches, and recycling facilities at Riverside Park.', authorId: 'u2', authorName: 'Sen. James Ward', createdAt: '2026-02-08', category: 'Environment', likes: 38, comments: [] },
]

const SEED_DISCUSSIONS = [
  { id: 'd1', title: 'Should we increase public transit frequency?', body: 'Given the growing population, it makes sense to discuss increasing bus frequency on major routes. What does the community think?', authorId: 'u2', authorName: 'Sen. James Ward', createdAt: '2026-02-14', category: 'Transport', replies: [{ id: 'dr1', authorId: 'u1', authorName: 'Alice Chen', text: 'Absolutely! Route 12 delays are a daily frustration for thousands of commuters.', createdAt: '2026-02-14' }], flagged: false },
  { id: 'd2', title: 'Green spaces in the city — your thoughts?', body: 'The city is considering converting unused lots into green spaces. Looking for community feedback before finalizing plans.', authorId: 'u2', authorName: 'Sen. James Ward', createdAt: '2026-02-10', replies: [], category: 'Environment', flagged: false },
]

export function DataProvider({ children }) {
  const [issues, setIssues] = useState(() => {
    try { return JSON.parse(localStorage.getItem('poli_issues')) || SEED_ISSUES } catch { return SEED_ISSUES }
  })
  const [updates, setUpdates] = useState(() => {
    try { return JSON.parse(localStorage.getItem('poli_updates')) || SEED_UPDATES } catch { return SEED_UPDATES }
  })
  const [discussions, setDiscussions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('poli_discussions')) || SEED_DISCUSSIONS } catch { return SEED_DISCUSSIONS }
  })

  useEffect(() => { localStorage.setItem('poli_issues', JSON.stringify(issues)) }, [issues])
  useEffect(() => { localStorage.setItem('poli_updates', JSON.stringify(updates)) }, [updates])
  useEffect(() => { localStorage.setItem('poli_discussions', JSON.stringify(discussions)) }, [discussions])

  function addIssue(issue) {
    setIssues(prev => [issue, ...prev])
  }
  function updateIssue(id, changes) {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i))
  }
  function deleteIssue(id) {
    setIssues(prev => prev.filter(i => i.id !== id))
  }
  function respondToIssue(issueId, response) {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, responses: [...i.responses, response] } : i))
  }
  function voteIssue(issueId) {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, votes: i.votes + 1 } : i))
  }

  function addUpdate(update) {
    setUpdates(prev => [update, ...prev])
  }
  function likeUpdate(id) {
    setUpdates(prev => prev.map(u => u.id === id ? { ...u, likes: u.likes + 1 } : u))
  }
  function commentOnUpdate(updateId, comment) {
    setUpdates(prev => prev.map(u => u.id === updateId ? { ...u, comments: [...u.comments, comment] } : u))
  }

  function addDiscussion(discussion) {
    setDiscussions(prev => [discussion, ...prev])
  }
  function replyToDiscussion(discussionId, reply) {
    setDiscussions(prev => prev.map(d => d.id === discussionId ? { ...d, replies: [...d.replies, reply] } : d))
  }
  function flagItem(type, id) {
    if (type === 'issue') setIssues(prev => prev.map(i => i.id === id ? { ...i, flagged: true } : i))
    if (type === 'discussion') setDiscussions(prev => prev.map(d => d.id === id ? { ...d, flagged: true } : d))
  }
  function unflagItem(type, id) {
    if (type === 'issue') setIssues(prev => prev.map(i => i.id === id ? { ...i, flagged: false } : i))
    if (type === 'discussion') setDiscussions(prev => prev.map(d => d.id === id ? { ...d, flagged: false } : d))
  }

  return (
    <DataContext.Provider value={{
      issues, updates, discussions,
      addIssue, updateIssue, deleteIssue, respondToIssue, voteIssue,
      addUpdate, likeUpdate, commentOnUpdate,
      addDiscussion, replyToDiscussion,
      flagItem, unflagItem,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
