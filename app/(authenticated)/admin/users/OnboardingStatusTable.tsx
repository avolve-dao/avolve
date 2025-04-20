"use client";
import React, { useEffect, useState } from "react";

interface UserOnboarding {
  id: string;
  email: string;
  completed_steps: string[];
  completed_at: string | null;
}

export default function OnboardingStatusTable() {
  const [users, setUsers] = useState<UserOnboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/onboarding-status");
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to fetch onboarding status.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        setError("Unexpected error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <div>Loading onboarding status...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Completed Steps</th>
            <th className="py-2 px-4 border-b">Completed At</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="hover:bg-blue-50">
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.completed_steps.join(", ")}</td>
              <td className="py-2 px-4 border-b">{user.completed_at ? new Date(user.completed_at).toLocaleString() : "In Progress"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
