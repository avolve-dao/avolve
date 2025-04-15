import { useCallback, useState } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';

export type Token = {
  id: string;
  symbol: string;
  name: string;
  description: string;
  gradientClass: string;
  iconUrl: string;
  isPrimary: boolean;
  isTransferable: boolean;
  parentTokenId?: string;
  parentTokenSymbol?: string;
  balance: number;
  stakedBalance: number;
  pendingRelease: number;
};

export type TokenResult<T> = {
  data: T | null;
  error: Error | null;
};

export type ExperiencePhase = 'discovery' | 'onboarding' | 'scaffolding' | 'endgame';

export type NextAction = {
  id: string;
  title: string;
  description: string;
  path: string;
  tokenRequired?: string;
  completed: boolean;
  locked: boolean;
};

/**
 * Hook for token-related functionality
 */
export function useToken() {
  const { supabase, session, user } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Get all token types
   */
  const getAllTokenTypes = useCallback(async (): Promise<TokenResult<Token[]>> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tokens')
        .select('*');
      
      if (error) throw error;
      
      const tokens = data.map((token: any) => ({
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        description: token.description,
        gradientClass: token.gradient_class,
        iconUrl: token.icon_url,
        isPrimary: token.is_primary,
        isTransferable: token.is_transferable,
        parentTokenId: token.parent_token_id,
        parentTokenSymbol: null, // Will be filled in later
        balance: 0,
        stakedBalance: 0,
        pendingRelease: 0
      }));
      
      // Fill in parent token symbols
      tokens.forEach(token => {
        if (token.parentTokenId) {
          const parentToken = tokens.find(t => t.id === token.parentTokenId);
          if (parentToken) {
            token.parentTokenSymbol = parentToken.symbol;
          }
        }
      });
      
      return { data: tokens, error: null };
    } catch (error) {
      console.error('Error getting all token types:', error);
      return { data: null, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  /**
   * Get token hierarchy
   */
  const getTokenHierarchy = useCallback(async (): Promise<TokenResult<Token[]>> => {
    if (!session?.user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('get_token_hierarchy');
      
      if (error) throw error;
      
      const tokens = data.map((token: any) => ({
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        description: token.description,
        gradientClass: token.gradient_class,
        iconUrl: token.icon_url,
        isPrimary: token.is_primary,
        isTransferable: token.is_transferable,
        parentTokenId: token.parent_token_id,
        parentTokenSymbol: null, // Will be filled in later
        balance: 0,
        stakedBalance: 0,
        pendingRelease: 0
      }));
      
      // Fill in parent token symbols
      tokens.forEach(token => {
        if (token.parentTokenId) {
          const parentToken = tokens.find(t => t.id === token.parentTokenId);
          if (parentToken) {
            token.parentTokenSymbol = parentToken.symbol;
          }
        }
      });
      
      return { data: tokens, error: null };
    } catch (error) {
      console.error('Error getting token hierarchy:', error);
      return { data: null, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  /**
   * Get user tokens
   */
  const getUserTokens = useCallback(async (userId?: string): Promise<TokenResult<Token[]>> => {
    const targetUserId = userId || user?.id;
    
    if (!session?.user || !targetUserId) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('get_user_tokens', { p_user_id: targetUserId });
      
      if (error) throw error;
      
      const tokens = data.map((token: any) => ({
        id: token.token_id,
        symbol: token.token_symbol,
        name: token.token_name,
        description: token.description,
        gradientClass: token.gradient_class,
        iconUrl: token.icon_url,
        isPrimary: token.is_primary,
        isTransferable: token.is_transferable,
        parentTokenId: token.parent_token_id,
        parentTokenSymbol: token.parent_token_symbol,
        balance: token.balance,
        stakedBalance: token.staked_balance,
        pendingRelease: token.pending_release
      }));
      
      return { data: tokens, error: null };
    } catch (error) {
      console.error('Error getting user tokens:', error);
      return { data: null, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session, user]);

  /**
   * Check if user has token access
   */
  const hasTokenAccess = useCallback(async (tokenSymbol: string, userId?: string): Promise<boolean> => {
    const targetUserId = userId || user?.id;
    
    if (!session?.user || !targetUserId) {
      return false;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('has_token_access', { 
          content_token_symbol: tokenSymbol,
          user_id: targetUserId
        });
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking token access:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session, user]);

  /**
   * Check if user has access to a pillar
   */
  const hasPillarAccess = useCallback(async (pillarId: string, userId?: string): Promise<boolean> => {
    const targetUserId = userId || user?.id;
    
    if (!session?.user || !targetUserId) {
      return false;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('has_pillar_access', { 
          p_pillar_id: pillarId,
          p_user_id: targetUserId
        });
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking pillar access:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session, user]);

  /**
   * Check if user has access to a section
   */
  const hasSectionAccess = useCallback(async (sectionId: string, userId?: string): Promise<boolean> => {
    const targetUserId = userId || user?.id;
    
    if (!session?.user || !targetUserId) {
      return false;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('has_section_access', { 
          p_section_id: sectionId,
          p_user_id: targetUserId
        });
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking section access:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session, user]);

  /**
   * Check if user has access to a component
   */
  const hasComponentAccess = useCallback(async (componentId: string, userId?: string): Promise<boolean> => {
    const targetUserId = userId || user?.id;
    
    if (!session?.user || !targetUserId) {
      return false;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('has_component_access', { 
          p_component_id: componentId,
          p_user_id: targetUserId
        });
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking component access:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session, user]);

  /**
   * Check if user has introductory access to content
   */
  const hasIntroductoryAccess = useCallback(async (contentType: string): Promise<boolean> => {
    if (!session?.user) {
      return false;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('has_introductory_access', { 
          p_content_type: contentType
        });
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking introductory access:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  /**
   * Complete content and get any rewards
   */
  const completeContent = useCallback(async (contentId: string): Promise<boolean> => {
    if (!session?.user) {
      return false;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('complete_content', { 
          p_content_id: contentId
        });
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error completing content:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  /**
   * Get all pillars progress
   */
  const getAllPillarsProgress = useCallback(async (userId?: string): Promise<TokenResult<any[]>> => {
    const targetUserId = userId || user?.id;
    
    if (!session?.user || !targetUserId) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('get_all_pillars_progress', { p_user_id: targetUserId });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting pillars progress:', error);
      return { data: null, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session, user]);

  /**
   * Track user activity
   */
  const trackActivity = useCallback(async (
    activityType: string,
    entityType?: string,
    entityId?: string,
    metadata?: any
  ): Promise<boolean> => {
    if (!session?.user) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .rpc('track_user_activity', { 
          p_activity_type: activityType,
          p_entity_type: entityType,
          p_entity_id: entityId,
          p_metadata: metadata
        });
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error tracking activity:', error);
      return false;
    }
  }, [supabase, session]);

  /**
   * Get user experience phase
   */
  const getUserExperiencePhase = useCallback(async (): Promise<ExperiencePhase> => {
    if (!session?.user) {
      return 'discovery';
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('get_user_experience_phase');
      
      if (error) throw error;
      
      return data as ExperiencePhase;
    } catch (error) {
      console.error('Error getting user experience phase:', error);
      return 'discovery';
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  /**
   * Get next recommended actions
   */
  const getNextRecommendedActions = useCallback(async (maxActions: number = 3): Promise<NextAction[]> => {
    if (!session?.user) {
      return [];
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('get_next_recommended_actions');
      
      if (error) throw error;
      
      // Convert from JSON to NextAction objects
      const actions: NextAction[] = (data || []).slice(0, maxActions).map((item: any, index: number) => ({
        id: `action-${index}`,
        title: item.title,
        description: item.description,
        path: item.url,
        tokenRequired: item.token_required,
        completed: item.completed || false,
        locked: item.locked || false
      }));
      
      return actions;
    } catch (error) {
      console.error('Error getting next recommended actions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  return {
    isLoading,
    getAllTokenTypes,
    getTokenHierarchy,
    getUserTokens,
    hasTokenAccess,
    hasPillarAccess,
    hasSectionAccess,
    hasComponentAccess,
    hasIntroductoryAccess,
    completeContent,
    getAllPillarsProgress,
    trackActivity,
    getUserExperiencePhase,
    getNextRecommendedActions
  };
}
