"use client";
import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function AdminUserTableClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const supabase = createClientComponentClient();
      // Fetch user profiles, onboarding, and token balances
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, phase, last_seen");
      if (profilesError) {
        setUsers([]);
        setLoading(false);
        return;
      }
      // Fetch onboarding status
      const { data: onboarding } = await supabase
        .from("user_onboarding")
        .select("user_id, completed_at");
      // Fetch token balances
      const { data: balances } = await supabase
        .from("user_balances")
        .select("user_id, amount");
      // Aggregate tokens per user
      const tokenMap = new Map();
      (balances || []).forEach((b) => {
        tokenMap.set(b.user_id, (tokenMap.get(b.user_id) || 0) + (b.amount || 0));
      });
      // Merge data
      const merged = profiles.map((p: any) => ({
        id: p.id,
        name: p.full_name || p.id,
        phase: p.phase || "-",
        tokens: tokenMap.get(p.id) || 0,
        lastSeen: p.last_seen ? new Date(p.last_seen).toLocaleDateString() : "-",
        onboardingCompleted: (onboarding || []).find((o: any) => o.user_id === p.id)?.completed_at,
      }));
      setUsers(merged);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  return (
    <div className="admin-user-table bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-2">Users</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Phase</th>
              <th className="py-2">Tokens</th>
              <th className="py-2">Last Seen</th>
              <th className="py-2">Onboarding</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="py-2">{user.name}</td>
                <td className="py-2">{user.phase}</td>
                <td className="py-2">{user.tokens}</td>
                <td className="py-2">{user.lastSeen}</td>
                <td className="py-2">
                  {user.onboardingCompleted ? (
                    <span className="text-green-600 font-semibold">✔</span>
                  ) : (
                    <span className="text-yellow-500">In Progress</span>
                  )}
                </td>
                <td className="py-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs mr-2">View</button>
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-xs">Promote</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
