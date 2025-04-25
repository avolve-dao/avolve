import { useEffect, useState } from 'react';
import { getRolePoints } from '../../lib/api/roles';

const ROLE_DETAILS: Record<
  string,
  { label: string; color: string; gradient: string; icon: string; description: string }
> = {
  subscriber: {
    label: 'Subscriber',
    color: '#A8A8A8',
    gradient: 'linear-gradient(90deg, #A8A8A8 0%, #E0E0E0 100%)',
    icon: '📖',
    description: 'Observe, learn, and subscribe to the Supercivilization journey.',
  },
  participant: {
    label: 'Participant',
    color: '#0099FF',
    gradient: 'linear-gradient(90deg, #FFD700 0%, #00CFFF 100%)',
    icon: '✍️',
    description: 'Engage, act, and participate in quests and discussions.',
  },
  contributor: {
    label: 'Contributor',
    color: '#7C3AED',
    gradient: 'linear-gradient(90deg, #7C3AED 0%, #F472B6 100%)',
    icon: '🚀',
    description: 'Lead, empower, and contribute to collective progress.',
  },
};

function getNextAction(roles: { role_type: string; points: number }[]) {
  // Simple nudge: suggest the lowest-point role to focus on
  if (!roles.length) return 'Start your journey by subscribing to a focus area!';
  const sorted = [...roles].sort((a, b) => a.points - b.points);
  const lowest = sorted[0];
  switch (lowest.role_type) {
    case 'subscriber':
      return 'Read a Supercivilization story or subscribe to a new quest.';
    case 'participant':
      return 'Join a quest or participate in a discussion to become a true Participant!';
    case 'contributor':
      return 'Propose a new challenge or mentor someone to unlock Contributor rewards!';
    default:
      return 'Keep exploring and leveling up your journey!';
  }
}

export default function RoleProgressionCard() {
  const [roles, setRoles] = useState<
    { role_type: string; points: number; last_action_at: string }[]
  >([]);

  useEffect(() => {
    getRolePoints().then(setRoles);
  }, []);

  const maxPoints = Math.max(...roles.map(r => r.points), 5);
  const nextAction = getNextAction(roles);

  return (
    <div
      className="card"
      style={{
        padding: '1.5rem',
        borderRadius: 12,
        background: '#f9f9fc',
        boxShadow: '0 2px 8px #e0e0e0',
      }}
    >
      <h3 style={{ marginBottom: 12 }}>Your Role Progression</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {['subscriber', 'participant', 'contributor'].map(roleType => {
          const role = roles.find(r => r.role_type === roleType) || {
            points: 0,
            last_action_at: '',
          };
          const details = ROLE_DETAILS[roleType];
          return (
            <li
              key={roleType}
              style={{
                marginBottom: 18,
                background: details.gradient,
                borderRadius: 8,
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 28, marginRight: 16 }}>{details.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 18, color: details.color }}>
                  {details.label}
                </div>
                <div style={{ fontSize: 13, color: '#444', marginBottom: 4 }}>
                  {details.description}
                </div>
                <div style={{ height: 8, background: '#eee', borderRadius: 4, margin: '6px 0' }}>
                  <div
                    style={{
                      width: `${Math.min(100, (role.points / maxPoints) * 100)}%`,
                      height: 8,
                      background: details.color,
                      borderRadius: 4,
                      transition: 'width 0.5s',
                    }}
                  />
                </div>
                <span style={{ fontSize: 13, color: '#666' }}>
                  Points: {role.points}{' '}
                  {role.last_action_at && (
                    <span style={{ marginLeft: 8, color: '#888' }}>
                      Last: {new Date(role.last_action_at).toLocaleString()}
                    </span>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: '#fffbe6',
          borderRadius: 8,
          color: '#b8860b',
          fontWeight: 500,
        }}
      >
        <span role="img" aria-label="Genie">
          🧞‍♂️
        </span>{' '}
        Next step: {nextAction}
      </div>
    </div>
  );
}
