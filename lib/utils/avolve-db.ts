/**
 * Avolve Database Utilities
 * 
 * This file provides utility functions for interacting with the Avolve platform database.
 */

import { createClient, TypedSupabaseClient } from '@/lib/supabase/client';
import type { Database, JourneyStatus } from '@/lib/types/database.types';

/**
 * Get all pillars
 */
export async function getPillars() {
  const supabase: TypedSupabaseClient = createClient();
  const { data, error } = await supabase
    .from('pillars')
    .select('*')
    .order('display_order');
  
  if (error) {
    console.error('Error fetching pillars:', error);
    throw error;
  }
  
  return data;
}

/**
 * Get a pillar by slug
 */
export async function getPillarBySlug(slug: string) {
  const supabase: TypedSupabaseClient = createClient();
  const { data, error } = await supabase
    .from('pillars')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error(`Error fetching pillar with slug ${slug}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Get sections for a pillar
 */
export async function getSectionsForPillar(pillarId: string) {
  const supabase: TypedSupabaseClient = createClient();
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('pillar_id', pillarId)
    .order('display_order');
  
  if (error) {
    console.error(`Error fetching sections for pillar ${pillarId}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Get a section by slug
 */
export async function getSectionBySlug(slug: string) {
  const supabase: TypedSupabaseClient = createClient();
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error(`Error fetching section with slug ${slug}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Get components for a section
 */
export async function getComponentsForSection(sectionId: string) {
  const supabase: TypedSupabaseClient = createClient();
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('section_id', sectionId)
    .order('display_order');
  
  if (error) {
    console.error(`Error fetching components for section ${sectionId}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Get a component by slug
 */
export async function getComponentBySlug(slug: string) {
  const supabase: TypedSupabaseClient = createClient();
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error(`Error fetching component with slug ${slug}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Start a user journey
 */
export async function startUserJourney(userId: string, pillarSlug: string) {
  const supabase: TypedSupabaseClient = createClient();
  const { data, error } = await supabase
    .rpc('start_user_journey', {
      user_id: userId,
      pillar_slug: pillarSlug
    });
  
  if (error) {
    console.error(`Error starting journey for user ${userId} on pillar ${pillarSlug}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Update component progress
 */
export async function updateComponentProgress(
  userId: string,
  componentSlug: string,
  status: JourneyStatus,
  currentState?: any,
  desiredState?: any,
  actionPlan?: any,
  results?: any
) {
  const supabase: TypedSupabaseClient = createClient();
  const { data, error } = await supabase
    .rpc('update_component_progress', {
      user_id: userId,
      component_slug: componentSlug,
      status,
      current_state: currentState,
      desired_state: desiredState,
      action_plan: actionPlan,
      results
    });
  
  if (error) {
    console.error(`Error updating progress for user ${userId} on component ${componentSlug}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Get user progress summary
 */
export async function getUserProgressSummary(userId: string) {
  const supabase: TypedSupabaseClient = createClient();
  const { data, error } = await supabase
    .rpc('get_user_progress_summary', {
      user_id: userId
    });
  
  if (error) {
    console.error(`Error fetching progress summary for user ${userId}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Get user journey for a pillar
 */
export async function getUserJourney(userId: string, pillarId: string) {
  const supabase: TypedSupabaseClient = createClient();
  const { data, error } = await supabase
    .from('user_journeys')
    .select('*')
    .eq('user_id', userId)
    .eq('pillar_id', pillarId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error(`Error fetching journey for user ${userId} on pillar ${pillarId}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Get user section progress
 */
export async function getUserSectionProgress(userId: string, sectionId: string) {
  const supabase: TypedSupabaseClient = createClient();
  const { data, error } = await supabase
    .from('user_section_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('section_id', sectionId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error(`Error fetching section progress for user ${userId} on section ${sectionId}:`, error);
    throw error;
  }
  
  return data;
}

/**
 * Get user component progress
 */
export async function getUserComponentProgress(userId: string, componentId: string) {
  const supabase: TypedSupabaseClient = createClient();
  const { data, error } = await supabase
    .from('user_component_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('component_id', componentId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error(`Error fetching component progress for user ${userId} on component ${componentId}:`, error);
    throw error;
  }
  
  return data;
}
