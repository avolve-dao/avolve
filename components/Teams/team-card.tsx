import React from 'react';

export function TeamCard({ team, variant }: { team: any; variant?: string }) {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold">Team Card</h3>
      <p>This is a placeholder for the TeamCard component.</p>
      {team && <p>Team ID: {team.id}</p>}
      {variant && <p>Variant: {variant}</p>}
    </div>
  );
}
