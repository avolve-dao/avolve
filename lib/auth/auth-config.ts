import { createClient as createSupabaseClient } from '../supabase/client';

export const authConfig = {
  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: { email: string; id: string };
      account: { provider: string; type: string };
      profile: { name: string; email: string };
    }) {
      return true; // Allow all sign-ins
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Handle redirect after sign-in
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/signin',
    signUp: '/signup',
    error: '/error',
    verifyRequest: '/verify',
    newUser: '/onboarding',
  },
};

// Initialize Supabase client
export const createClient: () => ReturnType<typeof createSupabaseClient> = () => {
  return createSupabaseClient();
};

// Auth helper functions
export const getAuthenticatedState = async () => {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return {
    isAuthenticated: !!session,
    user: session?.user ?? null,
    error,
  };
};

export const getOnboardingStatus = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', userId)
    .single();

  return {
    isComplete: data?.current_stage === 'complete',
    currentStage: data?.current_stage ?? 'welcome',
    error,
  };
};

// Rate limiting configuration
export const rateLimitConfig = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
  },
};

// Error messages
export const authErrors = {
  invalidCredentials: 'Invalid email or password',
  emailNotVerified: 'Please verify your email address',
  accountLocked: 'Account temporarily locked. Try again later',
  rateLimited: 'Too many attempts. Please try again later',
  serverError: 'An error occurred. Please try again',
};

// Validation rules
export const validationRules = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
  },
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
};
