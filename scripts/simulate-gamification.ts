/**
 * Avolve Gamification & Tokenomics Simulation Script
 * -----------------------------------------------
 * Simulates user onboarding, engagement, claims, badges, referrals, and group quests
 * to validate and iterate the Avolve gamification and tokenomics system.
 *
 * Usage: pnpm ts-node scripts/simulate-gamification.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// --- Parse CLI args for scenario config ---
const argv = process.argv.slice(2);
let scenarioPath = '';
let outputPath = '';
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--scenario' && argv[i + 1]) scenarioPath = argv[i + 1];
  if (argv[i] === '--output' && argv[i + 1]) outputPath = argv[i + 1];
}

// --- Load scenario config or use defaults ---
let scenario: any = {};
if (scenarioPath) {
  try {
    const scenarioRaw = fs.readFileSync(path.resolve(scenarioPath), 'utf-8');
    scenario = JSON.parse(scenarioRaw);
    console.log(`[INFO] Loaded scenario from ${scenarioPath}`);
  } catch (e) {
    console.error(`[ERROR] Failed to load scenario file: ${scenarioPath}`);
    process.exit(1);
  }
}

const NUM_USERS = scenario.num_users || 100;
const SIM_DAYS = scenario.sim_days || 21;
const USER_TYPES = scenario.user_types || [
  { type: 'normal', percent: 100, actions_per_day: 3 }
];
const INVITE_RATE = scenario.invite_rate ?? 0.2;
const GROUP_QUEST_RATE = scenario.group_quest_rate ?? 0.1;
const SPECIAL_EVENTS = scenario.special_events || [];
const TOKENS = ['SPD', 'SHE', 'PSP', 'SSA', 'BSP', 'SGB', 'SMS'];
const BADGE_CRITERIA = [
  { action_type: 'streak', min_streak: 7 },
  { action_type: 'invite', min_streak: 3 },
];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Missing Supabase environment variables.');
  process.exit(1);
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getDayToken(day: number): string {
  return TOKENS[day % 7];
}

// --- Synthetic User Generation ---
async function seedUsers(n: number, userTypes: any[]) {
  const users = [];
  const failedRegistrations = [];
  let userTypeList: any[] = [];
  userTypes.forEach(type => {
    const count = Math.round((type.percent / 100) * n);
    for (let i = 0; i < count; i++) userTypeList.push(type);
  });
  // Shuffle userTypeList to randomize assignment
  userTypeList = userTypeList.sort(() => Math.random() - 0.5);
  for (let i = 0; i < n; i++) {
    const email = `simuser${i}_${Math.floor(Math.random() * 1e9)}@avolve.ai`;
    const full_name = `Sim User ${i}`;
    const userType = userTypeList[i] || userTypes[0];
    try {
      console.log(`[SEED] Attempting user creation: ${email}`);
      const { data: userData, error: userError } = await (supabase as any).auth.admin.createUser({
        email,
        password: 'SimUserPassword123!',
        email_confirm: true
      });
      if (userError || !userData?.user?.id) {
        console.error(`[SEED] User creation failed: ${email}`);
        failedRegistrations.push({ email, error: userError, userData });
        continue;
      }
      const user_id = userData?.user?.id;
      const { data: profileData, error: profileError } = await supabase.from('profiles').insert({ id: user_id, user_email: email, full_name, user_type: userType.type }).select();
      if (profileError) {
        console.error(`[SEED] Profile creation failed for: ${email}`);
        failedRegistrations.push({ email, error: profileError, userData });
        continue;
      }
      users.push({ ...profileData[0], userType });
      console.log(`[SEED] User created: ${email}`);
    } catch (e) {
      console.error(`[SEED] Exception during user creation: ${email}`, e);
      failedRegistrations.push({ email, error: e });
    }
  }
  return { users, failedRegistrations };
}

// --- Simulate Actions ---
async function simulateDay(users: any[], day: number, scenario: any, stats: any) {
  const dayToken = getDayToken(day);
  const specialEvent = scenario.special_events?.find((ev: any) => ev.day === day);
  const rewardMultiplier = specialEvent && specialEvent.event === 'double_rewards' ? specialEvent.multiplier : 1;
  for (const user of users) {
    // 1. Log XP event
    await supabase.from('xp_events').insert({ user_id: user.id, xp_amount: (10 + Math.floor(Math.random() * 20)) * rewardMultiplier, event: 'daily_action', created_at: simDate(day) });
    stats.xp_events++;
    // 2. Claim token
    await supabase.from('fibonacci_token_rewards').insert({ user_id: user.id, token: dayToken, claimed_at: simDate(day), status: 'claimed' });
    stats.tokens[dayToken] = (stats.tokens[dayToken] || 0) + 1;
    // 3. Randomly invite another user
    if (Math.random() < (scenario.invite_rate ?? 0.2)) {
      const invitee = randomChoice(users.filter(u => u.id !== user.id));
      await supabase.from('referrals').insert({ inviter_id: user.id, invitee_id: invitee.id, invited_at: simDate(day), accepted: Math.random() < 0.7, bonus_awarded: false });
      stats.invites++;
    }
    // 4. Onboarding milestone
    if (day === 0) {
      await supabase.from('onboarding_events').insert({ user_id: user.id, milestone: 'signup', created_at: simDate(day) });
      stats.onboarded++;
    }
    // 5. Group quest
    if (Math.random() < (scenario.group_quest_rate ?? 0.1)) {
      await supabase.from('census_snapshots').insert({ scope: 'group', population: Math.floor(Math.random() * 20) + 5, activity_count: Math.floor(Math.random() * 20), created_at: simDate(day) });
      stats.group_quests++;
    }
    // 6. Badge event
    if (day > 0 && day % 7 === 0) {
      await supabase.from('badge_events').insert({ user_id: user.id, criteria: BADGE_CRITERIA[0], created_at: simDate(day) });
      stats.badges++;
    }
  }
}

function simDate(day: number) {
  const start = new Date();
  start.setDate(start.getDate() - SIM_DAYS + day);
  return start.toISOString();
}

// --- Main Simulation Loop ---
(async function main() {
  try {
    console.log('Seeding users...');
    const { users, failedRegistrations } = await seedUsers(NUM_USERS, USER_TYPES);
    console.log(`Seeded ${users.length} users.`);
    if (failedRegistrations.length > 0) {
      console.error(`\n[SUMMARY] ${failedRegistrations.length} user registrations failed.`);
      failedRegistrations.forEach((fail, idx) => {
        console.error(`\n#${idx + 1} Email: ${fail.email}`);
        console.error('Error:', JSON.stringify(fail.error, null, 2));
        console.error('UserData:', JSON.stringify(fail.userData, null, 2));
      });
    }
    // Always attempt to write registration errors, even if empty
    try {
      fs.writeFileSync('results/registration-errors.json', JSON.stringify(failedRegistrations, null, 2), 'utf-8');
      if (failedRegistrations.length > 0) {
        console.error('[INFO] Registration errors written to results/registration-errors.json');
      } else {
        console.log('[INFO] No registration errors. registration-errors.json written as empty.');
      }
    } catch (e) {
      console.error('[ERROR] Could not write registration errors to file:', e);
    }
    // Stats for summary output
    const stats: any = { xp_events: 0, tokens: {}, invites: 0, onboarded: 0, group_quests: 0, badges: 0 };
    for (let day = 0; day < SIM_DAYS; day++) {
      console.log(`Simulating day ${day + 1}/${SIM_DAYS}...`);
      await simulateDay(users, day, scenario, stats);
    }
    // Write summary report
    const summary = {
      scenario: scenario.name || 'default',
      num_users: NUM_USERS,
      sim_days: SIM_DAYS,
      stats,
      timestamp: new Date().toISOString()
    };
    if (outputPath) {
      fs.writeFileSync(path.resolve(outputPath), JSON.stringify(summary, null, 2), 'utf-8');
      console.log(`[INFO] Summary written to ${outputPath}`);
    } else {
      console.log('[SUMMARY]', JSON.stringify(summary, null, 2));
    }
    console.log('Simulation complete. Review results in your admin dashboard, analytics, or summary output.');
  } catch (e) {
    console.error('[FATAL] Uncaught error in main simulation loop:', e);
    process.exit(1);
  }
})();
