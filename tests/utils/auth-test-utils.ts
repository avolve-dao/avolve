import { createClient } from '@supabase/supabase-js'

// Test user types
export type TestUser = {
  email: string
  password: string
  userId?: string
}

// Create a test client with admin privileges
export const createTestClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Create a test user
export const createTestUser = async (user: TestUser) => {
  const supabase = createTestClient()
  
  // Create user
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  })

  if (error) throw error
  
  return {
    ...user,
    userId: data.user.id,
  }
}

// Delete a test user
export const deleteTestUser = async (userId: string) => {
  const supabase = createTestClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw error
}

// Clean up test data
export const cleanupTestData = async (userId: string) => {
  const supabase = createTestClient()
  
  // Delete onboarding data
  await supabase
    .from('user_onboarding')
    .delete()
    .eq('user_id', userId)

  // Delete profile data
  await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  // Delete user
  await deleteTestUser(userId)
}

// Get user's onboarding state
export const getTestUserOnboarding = async (userId: string) => {
  const supabase = createTestClient()
  const { data, error } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

// Simulate email verification
export const verifyTestUserEmail = async (userId: string) => {
  const supabase = createTestClient()
  const { error } = await supabase.auth.admin.updateUser(userId, {
    email_confirm: true,
  })
  if (error) throw error
}

// Get test user session
export const getTestUserSession = async (email: string, password: string) => {
  const supabase = createTestClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data.session
}

// Test data generators
export const generateTestEmail = () => {
  const timestamp = new Date().getTime()
  return `test.${timestamp}@example.com`
}

export const generateTestPassword = () => {
  return `Test${Math.random().toString(36).slice(2)}!`
}

// Assertion helpers
export const expectUserToBeAuthenticated = async (userId: string) => {
  const supabase = createTestClient()
  const { data, error } = await supabase.auth.admin.getUserById(userId)
  expect(error).toBeNull()
  expect(data.user).not.toBeNull()
  expect(data.user.id).toBe(userId)
}

export const expectOnboardingComplete = async (userId: string) => {
  const onboarding = await getTestUserOnboarding(userId)
  expect(onboarding.current_stage).toBe('complete')
  expect(onboarding.completed_stages).toContain('welcome')
  expect(onboarding.completed_stages).toContain('profile_setup')
  expect(onboarding.completed_stages).toContain('focus_selection')
  expect(onboarding.completed_stages).toContain('token_intro')
}
