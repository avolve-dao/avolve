import React from 'react';

// Placeholder: Replace with actual analytics data
const ANALYTICS = [
  { symbol: 'SAP', claims: 120, earnings: 4500 },
  { symbol: 'SCQ', claims: 80, earnings: 2100 },
  { symbol: 'GEN', claims: 30, earnings: 900 },
];

export function TokenAnalytics() {
  return (
    <div className="token-analytics bg-white rounded shadow p-4 mt-6">
      <h2 className="text-xl font-semibold mb-2">Token Analytics</h2>
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th className="py-2">Token</th>
            <th className="py-2">Claims</th>
            <th className="py-2">Earnings</th>
          </tr>
        </thead>
        <tbody>
          {ANALYTICS.map(row => (
            <tr key={row.symbol} className="border-t">
              <td className="py-2">{row.symbol}</td>
              <td className="py-2">{row.claims}</td>
              <td className="py-2">{row.earnings}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
