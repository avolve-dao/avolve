import { renderHook, act } from '@testing-library/react-hooks';
import { useFeatureFlags, FeatureFlagProvider, FEATURE_FLAGS } from './feature-flags';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock window.localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  data: null,
  error: null
};

const mockSupabaseContext = {
  supabase: mockSupabase,
  session: { user: { id: 'test-user-id' } },
  isLoading: false,
  error: null
};

// Mock useSupabase hook
vi.mock('@/lib/supabase/use-supabase', () => ({
  useSupabase: () => mockSupabaseContext
}));

describe('Feature Flags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_FEATURE_NEW_CHALLENGE_TYPES = 'true';
    process.env.NODE_ENV = 'development';
  });
  
  it('should initialize with default flags', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    );
    
    const { result } = renderHook(() => useFeatureFlags(), { wrapper });
    
    expect(result.current.flags).toEqual(expect.objectContaining({
      NEW_CHALLENGE_TYPES: true, // From env var
      ENHANCED_STREAK_VISUALIZATION: false,
      TEAM_CHALLENGES: false,
      ACHIEVEMENT_BADGES: false,
      TOKEN_MARKETPLACE: false,
      ADVANCED_ANALYTICS: false,
      DARK_MODE: true, // Default is true
    }));
  });
  
  it('should check if a feature is enabled', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    );
    
    const { result } = renderHook(() => useFeatureFlags(), { wrapper });
    
    expect(result.current.isEnabled(FEATURE_FLAGS.NEW_CHALLENGE_TYPES)).toBe(true);
    expect(result.current.isEnabled(FEATURE_FLAGS.ENHANCED_STREAK_VISUALIZATION)).toBe(false);
  });
  
  it('should set a feature flag', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    );
    
    const { result } = renderHook(() => useFeatureFlags(), { wrapper });
    
    act(() => {
      result.current.setFlag(FEATURE_FLAGS.ENHANCED_STREAK_VISUALIZATION, true);
    });
    
    expect(result.current.isEnabled(FEATURE_FLAGS.ENHANCED_STREAK_VISUALIZATION)).toBe(true);
    
    // Check localStorage in development mode
    expect(JSON.parse(localStorageMock.getItem('avolve_feature_flags') || '{}')).toEqual(
      expect.objectContaining({
        ENHANCED_STREAK_VISUALIZATION: true
      })
    );
  });
  
  it('should fetch remote flags on mount', async () => {
    // Mock Supabase response
    mockSupabase.select.mockImplementation(() => ({
      data: [
        {
          id: '1',
          name: 'TEAM_CHALLENGES',
          enabled: true,
          description: 'Enable team challenges feature',
          is_active: true,
          percentage_rollout: 100,
          user_group_ids: null
        }
      ],
      error: null
    }));
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    );
    
    const { result, waitForNextUpdate } = renderHook(() => useFeatureFlags(), { wrapper });
    
    // Wait for the useEffect to run
    await waitForNextUpdate();
    
    // Verify Supabase was called
    expect(mockSupabase.from).toHaveBeenCalledWith('feature_flags');
    expect(mockSupabase.select).toHaveBeenCalled();
    expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
    
    // Verify the flag was set from remote
    expect(result.current.isEnabled(FEATURE_FLAGS.TEAM_CHALLENGES)).toBe(true);
  });
  
  it('should handle remote flag fetch error', async () => {
    // Mock Supabase error response
    mockSupabase.select.mockImplementation(() => ({
      data: null,
      error: { message: 'Failed to fetch flags' }
    }));
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    );
    
    const { result, waitForNextUpdate } = renderHook(() => useFeatureFlags(), { wrapper });
    
    // Wait for the useEffect to run
    await waitForNextUpdate();
    
    // Should still have default flags
    expect(result.current.isEnabled(FEATURE_FLAGS.NEW_CHALLENGE_TYPES)).toBe(true);
    expect(result.current.error).not.toBeNull();
  });
  
  it('should apply percentage rollout based on user ID', async () => {
    // Mock Supabase response with percentage rollout
    mockSupabase.select.mockImplementation(() => ({
      data: [
        {
          id: '1',
          name: 'ACHIEVEMENT_BADGES',
          enabled: true,
          description: 'Enable achievement badges',
          is_active: true,
          percentage_rollout: 50, // 50% rollout
          user_group_ids: null
        }
      ],
      error: null
    }));
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    );
    
    const { result, waitForNextUpdate } = renderHook(() => useFeatureFlags(), { wrapper });
    
    // Wait for the useEffect to run
    await waitForNextUpdate();
    
    // The result will depend on the hash of the user ID, but it should be deterministic
    // for the same user ID
    const isEnabled = result.current.isEnabled(FEATURE_FLAGS.ACHIEVEMENT_BADGES);
    
    // Run it again with the same user ID, should get the same result
    mockSupabase.select.mockImplementation(() => ({
      data: [
        {
          id: '1',
          name: 'ACHIEVEMENT_BADGES',
          enabled: true,
          description: 'Enable achievement badges',
          is_active: true,
          percentage_rollout: 50,
          user_group_ids: null
        }
      ],
      error: null
    }));
    
    const { result: result2, waitForNextUpdate: waitForNextUpdate2 } = renderHook(() => useFeatureFlags(), { wrapper });
    
    // Wait for the useEffect to run
    await waitForNextUpdate2();
    
    expect(result2.current.isEnabled(FEATURE_FLAGS.ACHIEVEMENT_BADGES)).toBe(isEnabled);
  });
});
