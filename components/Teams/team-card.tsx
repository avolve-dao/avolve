import React from 'react';

export function TeamCard({ team, variant }: { team: unknown; variant?: string }) {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold">Team Card</h3>
      <p>This is a placeholder for the TeamCard component.</p>
      {typeof team === 'object' && team !== null && 'id' in team ? (
        <p>Team ID: {(team as { id: string }).id}</p>
      ) : null}
      {variant && <p>Variant: {variant}</p>}
    </div>
  );
}
