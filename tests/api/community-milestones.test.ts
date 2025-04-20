console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

import { describe, it, expect } from 'vitest';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/token/community-milestones';

// These tests assume your dev server is running on localhost:3000

describe('Community Milestones API', () => {
  let createdId: string | undefined;

  it('should create a new milestone', async () => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Milestone',
        target: 100,
        current: 0,
        reward: 'Test Reward',
        description: 'desc',
        achieved_at: null,
        updated_at: new Date().toISOString(),
      }),
    });
    const raw = await res.text();
    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      const errMsg = `Could not parse JSON response. Raw output: ${raw}`;
      console.error(errMsg);
      throw new Error(errMsg);
    }
    if (!res.ok || !json.success || !json.data || !json.data.id) {
      console.error('API response on create:', json, 'Raw:', raw, 'Status:', res.status);
      createdId = undefined;
      throw new Error('Milestone creation failed, cannot proceed with dependent tests.');
    }
    createdId = json.data.id;
  });

  it('should list all milestones', async () => {
    if (!createdId) return;
    const res = await fetch(BASE_URL);
    let json;
    try {
      json = await res.json();
    } catch (e) {
      return;
    }
    expect(json.success).toBeTruthy();
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('should get a milestone by id', async () => {
    if (!createdId) return;
    const res = await fetch(`${BASE_URL}/${createdId}`);
    let json;
    try {
      json = await res.json();
    } catch (e) {
      return;
    }
    expect(json.success).toBeTruthy();
    expect(json.data.id).toBe(createdId);
  });

  it('should update a milestone', async () => {
    if (!createdId) return;
    const res = await fetch(`${BASE_URL}/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: 50 }),
    });
    let json;
    try {
      json = await res.json();
    } catch (e) {
      return;
    }
    expect(json.success).toBeTruthy();
    expect(json.data.current).toBe(50);
  });
});
