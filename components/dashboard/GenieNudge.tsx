import { useEffect, useState } from 'react';
import { getRolePoints } from '../../lib/api/roles';

function getNextAction(roles: { role_type: string; points: number }[]) {
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

export default function GenieNudge() {
  const [roles, setRoles] = useState<{ role_type: string; points: number }[]>([]);
  const [nextAction, setNextAction] = useState('');

  useEffect(() => {
    getRolePoints().then(r => {
      setRoles(r);
      setNextAction(getNextAction(r));
    });
  }, []);

  return (
    <div className="card genie-nudge" style={{padding: '1.5rem', borderRadius: 12, background: '#fffbe6', color: '#b8860b', fontWeight: 500, marginTop: 16}}>
      <h3 style={{marginBottom: 8}}>Genie Suggests</h3>
      <span role="img" aria-label="Genie">🧞‍♂️</span> {nextAction}
    </div>
  );
}
