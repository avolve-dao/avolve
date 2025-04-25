import { useEffect, useState } from 'react';
import { getRoleHistory } from '../../lib/api/roles';

const ROLE_ICONS: Record<string, string> = {
  subscriber: '📖',
  participant: '✍️',
  contributor: '🚀',
};
const TOKEN_ICONS: Record<string, string> = {
  SAP: '🪨',
  PSP: '🌟',
  BSP: '💼',
  SMS: '🧠',
  GEN: '⚡',
  SCQ: '🧩',
  SPD: '🌈',
  SHE: '🧬',
  SSA: '🌱',
  SBG: '🔬',
};

function getTokenForAction(role_type: string, action_type: string): string | undefined {
  if (role_type === 'subscriber' && ['subscribe', 'read'].includes(action_type)) return 'SAP';
  if (role_type === 'participant' && ['join_quest', 'comment'].includes(action_type)) return 'PSP';
  if (role_type === 'contributor' && ['propose', 'review'].includes(action_type)) return 'SCQ';
  return undefined;
}

export default function RecentRoleActivity() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    getRoleHistory().then(setHistory);
  }, []);

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
      <h3 style={{ marginBottom: 12 }}>Recent Activity</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {history.map(act => {
          const token = getTokenForAction(act.role_type, act.action_type);
          return (
            <li key={act.id} style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 22, marginRight: 10 }}>
                {ROLE_ICONS[act.role_type] || '🧑‍💻'}
              </span>
              <span style={{ flex: 1 }}>
                <strong style={{ textTransform: 'capitalize' }}>{act.role_type}</strong>{' '}
                {act.action_type.replace('_', ' ')}
                <span style={{ marginLeft: 8, color: '#888', fontSize: 13 }}>
                  {new Date(act.created_at).toLocaleString()}
                </span>
              </span>
              {token && (
                <span style={{ marginLeft: 10, fontSize: 18 }} title={`Earned ${token}`}>
                  {TOKEN_ICONS[token] || token}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
