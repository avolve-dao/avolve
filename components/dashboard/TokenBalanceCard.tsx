import { useEffect, useState } from 'react';
import { getTokenBalances } from '../../lib/api/tokens';

const TOKEN_DETAILS: Record<string, { label: string; group: string; color: string; gradient: string; description: string }> = {
  GEN: { label: 'GEN', group: 'Ecosystem', color: '#8e99a9', gradient: 'linear-gradient(90deg, #b6c1d1 0%, #8e99a9 100%)', description: 'Supercivilization token for ecosystem transformation.' },
  SAP: { label: 'SAP', group: 'Individual', color: '#b8a07e', gradient: 'linear-gradient(90deg, #e6d1b3 0%, #b8a07e 100%)', description: 'Superachiever token for individual transformation.' },
  PSP: { label: 'PSP', group: 'Individual', color: '#ffd700', gradient: 'linear-gradient(90deg, #fff9b0 0%, #ffd700 100%)', description: 'Personal Success Puzzle token.' },
  BSP: { label: 'BSP', group: 'Individual', color: '#00cfff', gradient: 'linear-gradient(90deg, #b0f0ff 0%, #00cfff 100%)', description: 'Business Success Puzzle token.' },
  SMS: { label: 'SMS', group: 'Individual', color: '#d946ef', gradient: 'linear-gradient(90deg, #fbc2eb 0%, #d946ef 100%)', description: 'Supermind Superpowers token.' },
  SCQ: { label: 'SCQ', group: 'Collective', color: '#64748b', gradient: 'linear-gradient(90deg, #cbd5e1 0%, #64748b 100%)', description: 'Superachievers Quest token.' },
  SPD: { label: 'SPD', group: 'Collective', color: '#60a5fa', gradient: 'linear-gradient(90deg, #bae6fd 0%, #60a5fa 100%)', description: 'Superpuzzle Developments token.' },
  SHE: { label: 'SHE', group: 'Collective', color: '#fb7185', gradient: 'linear-gradient(90deg, #fbc2eb 0%, #fb7185 100%)', description: 'Superhuman Enhancements token.' },
  SSA: { label: 'SSA', group: 'Collective', color: '#34d399', gradient: 'linear-gradient(90deg, #d1fae5 0%, #34d399 100%)', description: 'Supersociety Advancements token.' },
  SBG: { label: 'SBG', group: 'Collective', color: '#6366f1', gradient: 'linear-gradient(90deg, #c7d2fe 0%, #6366f1 100%)', description: 'Supergenius Breakthroughs token.' },
};

const GROUP_ORDER = ['Individual', 'Collective', 'Ecosystem'];

export default function TokenBalanceCard() {
  const [tokens, setTokens] = useState<{ token_type: string; amount: number }[]>([]);

  useEffect(() => {
    getTokenBalances().then(setTokens);
  }, []);

  const grouped = tokens.reduce((acc, t) => {
    const details = TOKEN_DETAILS[t.token_type] || { group: 'Other', color: '#ccc', gradient: '', label: t.token_type, description: '' };
    (acc[details.group] = acc[details.group] || []).push({ ...t, ...details });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="card" style={{padding: '1.5rem', borderRadius: 12, background: '#f9f9fc', boxShadow: '0 2px 8px #e0e0e0'}}>
      <h3 style={{marginBottom: 12}}>Your Tokens</h3>
      {GROUP_ORDER.map(group => (
        grouped[group] && (
          <div key={group} style={{marginBottom: 16}}>
            <div style={{fontWeight: 600, fontSize: 16, marginBottom: 6}}>{group}</div>
            <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 12}}>
              {grouped[group].map(token => (
                <li key={token.token_type} style={{background: token.gradient, borderRadius: 8, padding: '0.5rem 1rem', minWidth: 110, position: 'relative'}}>
                  <span style={{fontWeight: 700, color: token.color}}>{token.label}</span>: <span style={{fontWeight: 500}}>{token.amount}</span>
                  <span style={{position: 'absolute', top: 6, right: 10, fontSize: 14, color: '#888'}} title={token.description}>ⓘ</span>
                </li>
              ))}
            </ul>
          </div>
        )
      ))}
    </div>
  );
}
