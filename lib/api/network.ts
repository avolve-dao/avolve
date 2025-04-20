/**
 * Network API Client
 * 
 * This client handles interactions with the physical network system of the Avolve platform,
 * including physical nodes, memberships, funding, and census tracking.
 */

import { ApiClient } from './client';
import type { 
  PhysicalNode, 
  NodeMembership, 
  NodeFunding, 
  NetworkCensus,
  NodeType,
  NodeStatus,
  MembershipType,
  MembershipStatus
} from '../types/database.types';

export class NetworkApi extends ApiClient {
  /**
   * Get all physical nodes
   * @param status Optional filter by node status
   * @returns Array of physical nodes
   */
  async getPhysicalNodes(status?: NodeStatus): Promise<PhysicalNode[]> {
    let query = this.client
      .from('physical_nodes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    this.handleError(error);
    return data || [];
  }

  /**
   * Get a specific physical node by ID
   * @param nodeId The ID of the node
   * @returns The node or null if not found
   */
  async getPhysicalNode(nodeId: string): Promise<PhysicalNode | null> {
    const { data, error } = await this.client
      .from('physical_nodes')
      .select('*')
      .eq('id', nodeId)
      .single();
    
    this.handleError(error);
    return data;
  }

  /**
   * Create a new physical node
   * @param node The node data to create
   * @returns The created node
   */
  async createPhysicalNode(node: Omit<PhysicalNode, 'id' | 'created_at' | 'updated_at'>): Promise<PhysicalNode> {
    const { data, error } = await this.client
      .from('physical_nodes')
      .insert(node)
      .select()
      .single();
    
    this.handleError(error);
    return data;
  }

  /**
   * Update a physical node
   * @param nodeId The ID of the node to update
   * @param updates The fields to update
   * @returns The updated node
   */
  async updatePhysicalNode(
    nodeId: string, 
    updates: Partial<Omit<PhysicalNode, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<PhysicalNode> {
    const { data, error } = await this.client
      .from('physical_nodes')
      .update(updates)
      .eq('id', nodeId)
      .select()
      .single();
    
    this.handleError(error);
    return data;
  }

  /**
   * Get all memberships for a specific node
   * @param nodeId The ID of the node
   * @param status Optional filter by membership status
   * @returns Array of node memberships
   */
  async getNodeMemberships(nodeId: string, status?: MembershipStatus): Promise<NodeMembership[]> {
    let query = this.client
      .from('node_memberships')
      .select('*')
      .eq('node_id', nodeId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    this.handleError(error);
    return data || [];
  }

  /**
   * Get all memberships for a specific user
   * @param userId The ID of the user
   * @param status Optional filter by membership status
   * @returns Array of node memberships
   */
  async getUserMemberships(userId: string, status?: MembershipStatus): Promise<NodeMembership[]> {
    let query = this.client
      .from('node_memberships')
      .select(`
        *,
        node:node_id(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    this.handleError(error);
    return data || [];
  }

  /**
   * Create a new node membership
   * @param membership The membership data to create
   * @returns The created membership
   */
  async createNodeMembership(
    membership: Omit<NodeMembership, 'id' | 'created_at' | 'updated_at'>
  ): Promise<NodeMembership> {
    const { data, error } = await this.client
      .from('node_memberships')
      .insert(membership)
      .select()
      .single();
    
    this.handleError(error);
    return data;
  }

  /**
   * Update a node membership
   * @param membershipId The ID of the membership to update
   * @param updates The fields to update
   * @returns The updated membership
   */
  async updateNodeMembership(
    membershipId: string, 
    updates: Partial<Omit<NodeMembership, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<NodeMembership> {
    const { data, error } = await this.client
      .from('node_memberships')
      .update(updates)
      .eq('id', membershipId)
      .select()
      .single();
    
    this.handleError(error);
    return data;
  }

  /**
   * Get all funding records for a specific node
   * @param nodeId The ID of the node
   * @returns Array of node funding records
   */
  async getNodeFunding(nodeId: string): Promise<NodeFunding[]> {
    const { data, error } = await this.client
      .from('node_funding')
      .select('*')
      .eq('node_id', nodeId)
      .order('created_at', { ascending: false });
    
    this.handleError(error);
    return data || [];
  }

  /**
   * Create a new node funding record
   * @param funding The funding data to create
   * @returns The created funding record
   */
  async createNodeFunding(
    funding: Omit<NodeFunding, 'id' | 'created_at' | 'updated_at'>
  ): Promise<NodeFunding> {
    const { data, error } = await this.client
      .from('node_funding')
      .insert(funding)
      .select()
      .single();
    
    this.handleError(error);
    return data;
  }

  /**
   * Update a node funding record
   * @param fundingId The ID of the funding record to update
   * @param updates The fields to update
   * @returns The updated funding record
   */
  async updateNodeFunding(
    fundingId: string, 
    updates: Partial<Omit<NodeFunding, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<NodeFunding> {
    const { data, error } = await this.client
      .from('node_funding')
      .update(updates)
      .eq('id', fundingId)
      .select()
      .single();
    
    this.handleError(error);
    return data;
  }

  /**
   * Get the latest network census
   * @returns The latest network census or null if none exists
   */
  async getLatestCensus(): Promise<NetworkCensus | null> {
    const { data, error } = await this.client
      .from('network_census')
      .select('*')
      .order('census_date', { ascending: false })
      .limit(1)
      .single();
    
    this.handleError(error);
    return data;
  }

  /**
   * Get all network census records
   * @param limit Optional limit on the number of records returned
   * @returns Array of network census records
   */
  async getAllCensusRecords(limit: number = 12): Promise<NetworkCensus[]> {
    const { data, error } = await this.client
      .from('network_census')
      .select('*')
      .order('census_date', { ascending: false })
      .limit(limit);
    
    this.handleError(error);
    return data || [];
  }

  /**
   * Create a new network census record
   * @param census The census data to create
   * @returns The created census record
   */
  async createNetworkCensus(
    census: Omit<NetworkCensus, 'id' | 'created_at' | 'updated_at'>
  ): Promise<NetworkCensus> {
    const { data, error } = await this.client
      .from('network_census')
      .insert(census)
      .select()
      .single();
    
    this.handleError(error);
    return data;
  }

  /**
   * Get nodes by geographic region
   * @param country Optional country filter
   * @param state Optional state/province filter
   * @param city Optional city filter
   * @returns Array of physical nodes matching the geographic criteria
   */
  async getNodesByRegion(
    country?: string, 
    state?: string, 
    city?: string
  ): Promise<PhysicalNode[]> {
    let query = this.client
      .from('physical_nodes')
      .select('*');
    
    if (country) {
      query = query.eq('country', country);
    }
    
    if (state) {
      query = query.eq('state_province', state);
    }
    
    if (city) {
      query = query.eq('city', city);
    }
    
    const { data, error } = await query;
    this.handleError(error);
    return data || [];
  }

  /**
   * Get nodes by type
   * @param nodeType The type of node to filter by
   * @returns Array of physical nodes of the specified type
   */
  async getNodesByType(nodeType: NodeType): Promise<PhysicalNode[]> {
    const { data, error } = await this.client
      .from('physical_nodes')
      .select('*')
      .eq('node_type', nodeType);
    
    this.handleError(error);
    return data || [];
  }

  /**
   * Calculate network growth metrics
   * @param months Number of months to analyze
   * @returns Growth metrics for nodes, members, and funding
   */
  async calculateNetworkGrowth(months: number = 12): Promise<{
    nodeGrowth: { date: string; count: number }[];
    memberGrowth: { date: string; count: number }[];
    fundingGrowth: { date: string; amount: number }[];
  }> {
    // Get census records for the specified period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const { data: censusData, error: censusError } = await this.client
      .from('network_census')
      .select('*')
      .gte('census_date', startDate.toISOString())
      .lte('census_date', endDate.toISOString())
      .order('census_date', { ascending: true });
    
    this.handleError(censusError);
    
    // Transform census data into growth metrics
    const nodeGrowth = censusData?.map((census: { census_date: string; total_nodes: number }) => ({
      date: census.census_date,
      count: census.total_nodes
    })) || [];
    
    const memberGrowth = censusData?.map((census: { census_date: string; total_members: number }) => ({
      date: census.census_date,
      count: census.total_members
    })) || [];
    
    const fundingGrowth = censusData?.map((census: { census_date: string; total_funding: number }) => ({
      date: census.census_date,
      amount: census.total_funding
    })) || [];
    
    return {
      nodeGrowth,
      memberGrowth,
      fundingGrowth
    };
  }
}
