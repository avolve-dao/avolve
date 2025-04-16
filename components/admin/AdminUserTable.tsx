import React from 'react';
import { AdminUserTableClient } from './AdminUserTableClient';

// Placeholder: Replace with actual Supabase data fetching
const USERS = [
  { id: '1', name: 'Alice', phase: 'discovery', tokens: 100, lastSeen: '2025-04-15' },
  { id: '2', name: 'Bob', phase: 'onboarding', tokens: 250, lastSeen: '2025-04-16' },
];

export function AdminUserTable() {
  return <AdminUserTableClient />;
}
