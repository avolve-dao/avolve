/**
 * Identity API Client
 * 
 * This client handles interactions with the identity system of the Avolve platform,
 * including genius profiles, achievements, and level definitions.
 */

import { ApiClient } from './client';
import type { GeniusProfile } from '../types/database.types';

// TEMP: Define GeniusLevelDefinition locally if not imported
export type GeniusLevelDefinition = {
  level_number: number;
  points_threshold: number;
  [key: string]: any;
};

export class IdentityApi extends ApiClient {
  /**
   * Get a user's genius profile
   * @param userId The ID of the user
   * @returns The genius profile or null if not found
   */
  async getGeniusProfile(userId: string): Promise<GeniusProfile | null> {
    const { data, error } = await this.client
      .from('genius_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    this.handleError(error);
    return data;
  }

  /**
   * Create a new genius profile for a user
   * @param userId The ID of the user
   * @param geniusId The unique genius ID for the profile
   * @param avatarUrl Optional URL to the user's avatar
   * @param bio Optional biography text
   * @returns The ID of the created profile
   */
  async createGeniusProfile(
    userId: string, 
    geniusId: string, 
    avatarUrl?: string, 
    bio?: string
  ): Promise<string> {
    const { data, error } = await this.client.rpc('create_genius_profile', {
      p_user_id: userId,
      p_genius_id: geniusId,
      p_avatar_url: avatarUrl,
      p_bio: bio
    });
    
    this.handleError(error);
    return data;
  }

  /**
   * Update a user's genius profile
   * @param profileId The ID of the profile to update
   * @param updates The fields to update
   * @returns The updated profile
   */
  async updateGeniusProfile(
    profileId: string, 
    updates: Partial<Omit<GeniusProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<GeniusProfile> {
    const { data, error } = await this.client
      .from('genius_profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();
    
    this.handleError(error);
    return data;
  }

  /**
   * Update a user's degen/regen score
   * @param userId The ID of the user
   * @param scoreChange The amount to change the score by (positive or negative)
   * @returns The new score
   */
  async updateDegenRegenScore(userId: string, scoreChange: number): Promise<number> {
    const { data, error } = await this.client.rpc('update_degen_regen_score', {
      p_user_id: userId,
      p_score_change: scoreChange
    });
    
    this.handleError(error);
    return data;
  }

  /**
   * Get all achievements for a user
   * @param userId The ID of the user
   * @returns Array of achievements
   */
  async getUserAchievements(userId: string): Promise<any[]> {
    const { data, error } = await this.client
      .from('genius_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    this.handleError(error);
    return data || [];
  }

  /**
   * Award an achievement to a user
   * @param userId The ID of the user
   * @param achievementType The type of achievement
   * @param title The title of the achievement
   * @param description Optional description of the achievement
   * @param points Optional points value for the achievement
   * @param metadata Optional additional data for the achievement
   * @returns The ID of the created achievement
   */
  async awardAchievement(
    userId: string, 
    achievementType: any, 
    title: string, 
    description?: string, 
    points?: number, 
    metadata?: any
  ): Promise<string> {
    const { data, error } = await this.client.rpc('award_achievement', {
      p_user_id: userId,
      p_achievement_type: achievementType,
      p_title: title,
      p_description: description,
      p_points: points,
      p_metadata: metadata
    });
    
    this.handleError(error);
    return data;
  }

  /**
   * Get all genius level definitions
   * @returns Array of level definitions
   */
  async getLevelDefinitions(): Promise<GeniusLevelDefinition[]> {
    const { data, error } = await this.client
      .from('genius_level_definitions')
      .select('*')
      .order('level_number', { ascending: true });

    this.handleError(error);
    // Ensure the result is always properly typed
    if (!Array.isArray(data)) return [];
    return data as GeniusLevelDefinition[];
  }

  /**
   * Get a specific genius level definition
   * @param levelNumber The level number
   * @returns The level definition or null if not found
   */
  async getLevelDefinition(levelNumber: number): Promise<GeniusLevelDefinition | null> {
    const { data, error } = await this.client
      .from('genius_level_definitions')
      .select('*')
      .eq('level_number', levelNumber)
      .single();
    
    this.handleError(error);
    return data;
  }

  /**
   * Calculate a user's current level based on their achievements and activity
   * @param userId The ID of the user
   * @returns The user's current level and progress to next level
   */
  async calculateUserLevel(userId: string): Promise<{ level: number; progress: number }> {
    // Get user's achievements and their total points
    const achievements = await this.getUserAchievements(userId);
    const totalPoints = achievements.reduce((sum, achievement) => sum + (achievement.points || 0), 0);
    
    // Get all level definitions
    const levelDefinitions = (await this.getLevelDefinitions()) as unknown as GeniusLevelDefinition[];
    
    // Defensive: filter out any items missing the required fields
    const validLevelDefinitions: GeniusLevelDefinition[] = (levelDefinitions as any[]).filter(
      (def: any): def is GeniusLevelDefinition =>
        typeof def === 'object' && def !== null &&
        typeof (def as GeniusLevelDefinition).level_number === 'number' &&
        typeof (def as GeniusLevelDefinition).points_threshold === 'number'
    );
    
    // Find the user's current level
    let currentLevel = 1;
    let nextLevelThreshold = 0;
    for (let i = 0; i < validLevelDefinitions.length; i++) {
      if (totalPoints >= validLevelDefinitions[i].points_threshold) {
        currentLevel = validLevelDefinitions[i].level_number;
        nextLevelThreshold = i < validLevelDefinitions.length - 1 
          ? validLevelDefinitions[i + 1].points_threshold 
          : validLevelDefinitions[i].points_threshold;
      } else {
        nextLevelThreshold = validLevelDefinitions[i].points_threshold;
        break;
      }
    }
    
    // Calculate progress to next level
    const currentLevelThreshold = validLevelDefinitions.find(def => def.level_number === currentLevel)?.points_threshold || 0;
    const progress = nextLevelThreshold > currentLevelThreshold
      ? (totalPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)
      : 1; // If at max level, progress is 100%
    
    return { level: currentLevel, progress };
  }
}
