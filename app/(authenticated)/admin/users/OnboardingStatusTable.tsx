'use client';
import React, { useEffect, useState } from 'react';
import { AdminCelebrationToast } from '@/components/admin/AdminCelebrationToast';

interface UserOnboarding {
  id: string;
  email: string;
  name?: string;
  role?: string;
  date_joined?: string | null;
  completed_steps: string[];
  current_step?: string | null;
  completed_at: string | null;
  support_admin_id?: string | null;
  support_admin_name?: string | null;
  marked_complete_by_admin_id?: string | null;
  marked_complete_admin_name?: string | null;
}

type Filter = {
  step: string;
  role: string;
  status: string;
};

const defaultFilter: Filter = {
  step: '',
  role: '',
  status: '',
};

export default function OnboardingStatusTable() {
  const [users, setUsers] = useState<UserOnboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const [sortBy, setSortBy] = useState<keyof UserOnboarding | ''>('');
  const [sortAsc, setSortAsc] = useState(true);
  const [reminderUserId, setReminderUserId] = useState<string | null>(null);
  const [reminderStatus, setReminderStatus] = useState<string>('');

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedUser, setCelebratedUser] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/onboarding-status');
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to fetch onboarding status.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        setError('Unexpected error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Get unique steps and roles for filter dropdowns
  const allSteps = Array.from(
    new Set(users.flatMap(u => u.completed_steps.concat(u.current_step || [])))
  ).filter(Boolean);
  const allRoles = Array.from(new Set(users.map(u => u.role || 'user')));

  // Filtering
  let filteredUsers = users.filter(user => {
    const stepMatch = !filter.step || user.current_step === filter.step;
    const roleMatch = !filter.role || user.role === filter.role;
    const statusMatch =
      !filter.status || (filter.status === 'complete' ? !!user.completed_at : !user.completed_at);
    return stepMatch && roleMatch && statusMatch;
  });

  // Sorting
  if (sortBy) {
    filteredUsers = filteredUsers.slice().sort((a, b) => {
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  async function handleSendReminder(user: UserOnboarding) {
    setReminderUserId(user.id);
    setReminderStatus('');
    try {
      const res = await fetch('/api/admin/onboarding-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setReminderStatus(data.error || 'Failed to send reminder.');
      } else {
        setReminderStatus('Reminder sent!');
      }
    } catch (e) {
      setReminderStatus('Failed to send reminder.');
    } finally {
      setTimeout(() => {
        setReminderUserId(null);
        setReminderStatus('');
      }, 2000);
    }
  }

  async function handleAssignSupport(user: UserOnboarding) {
    try {
      const res = await fetch('/api/admin/onboarding-assign-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to assign support admin.');
      } else {
        alert('Support admin assigned!');
        // Optionally, refetch users
      }
    } catch {
      alert('Failed to assign support admin.');
    }
  }

  async function handleMarkComplete(user: UserOnboarding) {
    if (!window.confirm("Are you sure you want to mark this user's onboarding as complete?"))
      return;
    try {
      const res = await fetch('/api/admin/onboarding-mark-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to mark onboarding complete.');
      } else {
        setShowCelebration(true);
        setCelebratedUser(user.name || user.email);
        setTimeout(() => setShowCelebration(false), 4000);
      }
    } catch {
      alert('Failed to mark onboarding complete.');
    }
  }

  if (loading) return <div>Loading onboarding status...</div>;
  if (error)
    return (
      <div className="text-red-500" role="alert">
        {error}
      </div>
    );

  return (
    <div className="overflow-x-auto" aria-live="polite">
      {showCelebration && (
        <AdminCelebrationToast
          show={showCelebration}
          userName={celebratedUser}
          onClose={() => setShowCelebration(false)}
        />
      )}
      <div className="flex flex-wrap gap-4 mb-2" role="region" aria-label="Filters">
        <label
          htmlFor="filter-step"
          className="flex items-center"
          title="Filter users by their current onboarding step"
        >
          Step:
          <select
            id="filter-step"
            value={filter.step}
            onChange={e => setFilter(f => ({ ...f, step: e.target.value }))}
            className="ml-2 border rounded focus:outline-blue-500"
            aria-label="Filter by onboarding step"
          >
            <option value="">All</option>
            {allSteps.map(step => (
              <option key={step} value={step}>
                {step}
              </option>
            ))}
          </select>
        </label>
        <label
          htmlFor="filter-role"
          className="flex items-center"
          title="Filter users by their role"
        >
          Role:
          <select
            id="filter-role"
            value={filter.role}
            onChange={e => setFilter(f => ({ ...f, role: e.target.value }))}
            className="ml-2 border rounded focus:outline-blue-500"
            aria-label="Filter by user role"
          >
            <option value="">All</option>
            {allRoles.map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <label
          htmlFor="filter-status"
          className="flex items-center"
          title="Filter users by onboarding completion status"
        >
          Status:
          <select
            id="filter-status"
            value={filter.status}
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            className="ml-2 border rounded focus:outline-blue-500"
            aria-label="Filter by onboarding status"
          >
            <option value="">All</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </label>
        <span className="text-gray-500 text-xs ml-4" aria-live="polite">
          Use Tab to navigate filters. Press Enter to apply.
        </span>
      </div>
      <table
        className="min-w-full border border-gray-300 rounded shadow"
        aria-label="Onboarding status table"
      >
        <thead>
          <tr className="bg-gray-100">
            {[
              { label: 'Email', key: 'email', tooltip: "User's email address" },
              { label: 'Name', key: 'name', tooltip: "User's full name" },
              { label: 'Role', key: 'role', tooltip: "User's role in the platform" },
              { label: 'Date Joined', key: 'date_joined', tooltip: 'Date the user joined' },
              { label: 'Current Step', key: 'current_step', tooltip: 'Current onboarding step' },
              {
                label: 'Completed Steps',
                key: 'completed_steps',
                tooltip: 'All completed onboarding steps',
              },
              {
                label: 'Completed At',
                key: 'completed_at',
                tooltip: 'When onboarding was completed',
              },
              {
                label: 'Support Admin',
                key: 'support_admin_name',
                tooltip: 'Support admin assigned to this user',
              },
              {
                label: 'Marked Complete By',
                key: 'marked_complete_admin_name',
                tooltip: 'Admin who marked onboarding complete',
              },
              {
                label: 'Actions',
                key: 'actions',
                tooltip: 'Admin actions for this user',
                isAction: true,
              },
            ].map(col => (
              <th
                key={col.key}
                className="py-2 px-4 border-b cursor-pointer select-none focus:outline-blue-500"
                onClick={() => {
                  if (!col.isAction) {
                    if (sortBy === col.key) setSortAsc(a => !a);
                    else {
                      setSortBy(col.key as keyof UserOnboarding);
                      setSortAsc(true);
                    }
                  }
                }}
                tabIndex={0}
                aria-label={`Sort by ${col.label}`}
                title={col.tooltip}
                scope="col"
                role="columnheader"
              >
                {col.label}
                {sortBy === col.key && !col.isAction && (sortAsc ? ' ▲' : ' ▼')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id} className="hover:bg-blue-50 focus-within:bg-blue-100" tabIndex={0}>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.name || '-'}</td>
              <td className="py-2 px-4 border-b">{user.role || 'user'}</td>
              <td className="py-2 px-4 border-b">
                {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : '-'}
              </td>
              <td className="py-2 px-4 border-b">{user.current_step || '-'}</td>
              <td className="py-2 px-4 border-b">{user.completed_steps.join(', ')}</td>
              <td className="py-2 px-4 border-b">
                {user.completed_at ? new Date(user.completed_at).toLocaleString() : 'In Progress'}
              </td>
              <td className="py-2 px-4 border-b">{user.support_admin_name || '-'}</td>
              <td className="py-2 px-4 border-b">{user.marked_complete_admin_name || '-'}</td>
              <td className="py-2 px-4 border-b">
                <button
                  className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs focus:outline-blue-500 focus:ring-2 focus:ring-blue-400 mr-1"
                  disabled={reminderUserId === user.id}
                  onClick={() => handleSendReminder(user)}
                  title="Send onboarding reminder to user"
                  aria-label={`Send onboarding reminder to ${user.email}`}
                >
                  {reminderUserId === user.id ? reminderStatus || 'Sending...' : 'Send Reminder'}
                </button>
                <button
                  className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-xs focus:outline-green-500 focus:ring-2 focus:ring-green-400 mr-1"
                  onClick={() => handleAssignSupport(user)}
                  title="Assign yourself as support admin"
                  aria-label={`Assign support admin to ${user.email}`}
                >
                  Assign Support
                </button>
                <button
                  className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 text-xs focus:outline-purple-500 focus:ring-2 focus:ring-purple-400"
                  onClick={() => handleMarkComplete(user)}
                  title="Mark onboarding as complete"
                  aria-label={`Mark onboarding complete for ${user.email}`}
                  disabled={!!user.completed_at}
                >
                  Mark as Complete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-gray-600 text-xs mt-2" aria-live="polite">
        Table is keyboard navigable. Use Tab/Shift+Tab to move between filters, headers, and
        actions. Use Enter to sort columns or activate buttons.
      </div>
    </div>
  );
}
