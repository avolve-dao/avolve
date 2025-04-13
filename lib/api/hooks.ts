/**
 * API Client Hooks
 * 
 * This file provides React hooks for using the API clients in components.
 * These hooks ensure consistent client creation and caching across the application.
 */

import { useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../types/database.types';
import { 
  CommunityApi, 
  EconomyApi, 
  IdentityApi, 
  GovernanceApi, 
  NetworkApi 
} from './index';

// Cache for API clients to avoid recreating them unnecessarily
const clientCache = new Map<string, any>();

/**
 * Hook for using the Community API client
 * @returns An instance of the CommunityApi client
 */
export function useCommunityApi() {
  const getClient = useCallback(() => {
    if (!clientCache.has('community')) {
      const supabase = createClientComponentClient<Database>();
      clientCache.set('community', new CommunityApi(supabase));
    }
    return clientCache.get('community') as CommunityApi;
  }, []);

  return getClient();
}

/**
 * Hook for using the Economy API client
 * @returns An instance of the EconomyApi client
 */
export function useEconomyApi() {
  const getClient = useCallback(() => {
    if (!clientCache.has('economy')) {
      const supabase = createClientComponentClient<Database>();
      clientCache.set('economy', new EconomyApi(supabase));
    }
    return clientCache.get('economy') as EconomyApi;
  }, []);

  return getClient();
}

/**
 * Hook for using the Identity API client
 * @returns An instance of the IdentityApi client
 */
export function useIdentityApi() {
  const getClient = useCallback(() => {
    if (!clientCache.has('identity')) {
      const supabase = createClientComponentClient<Database>();
      clientCache.set('identity', new IdentityApi(supabase));
    }
    return clientCache.get('identity') as IdentityApi;
  }, []);

  return getClient();
}

/**
 * Hook for using the Governance API client
 * @returns An instance of the GovernanceApi client
 */
export function useGovernanceApi() {
  const getClient = useCallback(() => {
    if (!clientCache.has('governance')) {
      const supabase = createClientComponentClient<Database>();
      clientCache.set('governance', new GovernanceApi(supabase));
    }
    return clientCache.get('governance') as GovernanceApi;
  }, []);

  return getClient();
}

/**
 * Hook for using the Network API client
 * @returns An instance of the NetworkApi client
 */
export function useNetworkApi() {
  const getClient = useCallback(() => {
    if (!clientCache.has('network')) {
      const supabase = createClientComponentClient<Database>();
      clientCache.set('network', new NetworkApi(supabase));
    }
    return clientCache.get('network') as NetworkApi;
  }, []);

  return getClient();
}

/**
 * Helper function to create server-side API clients
 * @param supabaseClient The server supabase client
 * @returns Object containing all API clients
 */
export function createServerApiClients(supabaseClient: any) {
  return {
    community: new CommunityApi(supabaseClient),
    economy: new EconomyApi(supabaseClient),
    identity: new IdentityApi(supabaseClient),
    governance: new GovernanceApi(supabaseClient),
    network: new NetworkApi(supabaseClient),
  };
}
