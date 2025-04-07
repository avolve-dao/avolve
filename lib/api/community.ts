/**
 * Community API Client
 * 
 * This file provides functions for interacting with the community structure
 * of the Avolve platform, including pillars, routes, sections, and components.
 */

import { ApiClient, ApiError } from './client'
import type { Pillar, Route, Section, Component, UserJourney, UserComponentProgress } from '@/lib/types/database.types'

export class CommunityApi extends ApiClient {
  /**
   * Get all pillars
   */
  async getPillars() {
    try {
      const { data, error } = await this.client
        .from('pillars')
        .select('*')
        .order('display_order')
      
      if (error) throw error
      
      return data as Pillar[]
    } catch (error) {
      this.handleError(error, 'Failed to fetch pillars')
    }
  }
  
  /**
   * Get a pillar by slug
   */
  async getPillarBySlug(slug: string) {
    try {
      const { data, error } = await this.client
        .from('pillars')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error) throw error
      
      return data as Pillar
    } catch (error) {
      this.handleError(error, `Failed to fetch pillar with slug: ${slug}`)
    }
  }
  
  /**
   * Get routes for a pillar
   */
  async getRoutesByPillarId(pillarId: string) {
    try {
      const { data, error } = await this.client
        .from('routes')
        .select('*')
        .eq('pillar_id', pillarId)
        .order('display_order')
      
      if (error) throw error
      
      return data as Route[]
    } catch (error) {
      this.handleError(error, `Failed to fetch routes for pillar: ${pillarId}`)
    }
  }
  
  /**
   * Get a route by slug
   */
  async getRouteBySlug(slug: string) {
    try {
      const { data, error } = await this.client
        .from('routes')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error) throw error
      
      return data as Route
    } catch (error) {
      this.handleError(error, `Failed to fetch route with slug: ${slug}`)
    }
  }
  
  /**
   * Get sections for a route
   */
  async getSectionsByRouteId(routeId: string) {
    try {
      const { data, error } = await this.client
        .from('sections')
        .select('*')
        .eq('route_id', routeId)
        .order('display_order')
      
      if (error) throw error
      
      return data as Section[]
    } catch (error) {
      this.handleError(error, `Failed to fetch sections for route: ${routeId}`)
    }
  }
  
  /**
   * Get components for a section
   */
  async getComponentsBySectionId(sectionId: string) {
    try {
      const { data, error } = await this.client
        .from('components')
        .select('*')
        .eq('section_id', sectionId)
        .order('display_order')
      
      if (error) throw error
      
      return data as Component[]
    } catch (error) {
      this.handleError(error, `Failed to fetch components for section: ${sectionId}`)
    }
  }
  
  /**
   * Get a component by ID
   */
  async getComponentById(componentId: string) {
    try {
      const { data, error } = await this.client
        .from('components')
        .select('*')
        .eq('id', componentId)
        .single()
      
      if (error) throw error
      
      return data as Component
    } catch (error) {
      this.handleError(error, `Failed to fetch component: ${componentId}`)
    }
  }
  
  /**
   * Get user journeys
   */
  async getUserJourneys(userId: string) {
    try {
      const { data, error } = await this.client
        .from('user_journeys')
        .select('*, pillars(*), routes(*)')
        .eq('user_id', userId)
      
      if (error) throw error
      
      return data
    } catch (error) {
      this.handleError(error, 'Failed to fetch user journeys')
    }
  }
  
  /**
   * Get user journey for a specific pillar
   */
  async getUserJourneyForPillar(userId: string, pillarId: string) {
    try {
      const { data, error } = await this.client
        .from('user_journeys')
        .select('*')
        .eq('user_id', userId)
        .eq('pillar_id', pillarId)
        .single()
      
      if (error && error.code !== 'PGRST116') { // Not found error
        throw error
      }
      
      return data as UserJourney | null
    } catch (error) {
      this.handleError(error, `Failed to fetch user journey for pillar: ${pillarId}`)
    }
  }
  
  /**
   * Get user component progress
   */
  async getUserComponentProgress(userId: string, componentId: string) {
    try {
      const { data, error } = await this.client
        .from('user_component_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('component_id', componentId)
        .single()
      
      if (error && error.code !== 'PGRST116') { // Not found error
        throw error
      }
      
      return data as UserComponentProgress | null
    } catch (error) {
      this.handleError(error, `Failed to fetch user progress for component: ${componentId}`)
    }
  }
  
  /**
   * Update user component progress
   */
  async updateUserComponentProgress(
    userId: string,
    componentId: string,
    data: Partial<Omit<UserComponentProgress, 'id' | 'user_id' | 'component_id' | 'created_at' | 'updated_at'>>
  ) {
    try {
      // Check if progress exists
      const existing = await this.getUserComponentProgress(userId, componentId)
      
      if (existing) {
        // Update existing progress
        const { data: updated, error } = await this.client
          .from('user_component_progress')
          .update(data)
          .eq('id', existing.id)
          .select()
          .single()
        
        if (error) throw error
        
        return updated as UserComponentProgress
      } else {
        // Create new progress
        const { data: created, error } = await this.client
          .from('user_component_progress')
          .insert({
            user_id: userId,
            component_id: componentId,
            ...data
          })
          .select()
          .single()
        
        if (error) throw error
        
        return created as UserComponentProgress
      }
    } catch (error) {
      this.handleError(error, `Failed to update user progress for component: ${componentId}`)
    }
  }
  
  /**
   * Get user progress summary
   */
  async getUserProgressSummary(userId: string) {
    try {
      const { data, error } = await this.client.rpc('get_user_progress_summary', {
        user_id: userId
      })
      
      if (error) throw error
      
      return data
    } catch (error) {
      this.handleError(error, 'Failed to fetch user progress summary')
    }
  }
}
