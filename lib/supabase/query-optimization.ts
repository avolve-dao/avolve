import { createClient } from './client';
import { captureException } from '@/lib/monitoring/error-tracking';
import { DbResponse, executeQuery } from './db-utils';

/**
 * Batch query options
 */
interface BatchQueryOptions {
  client?: ReturnType<typeof createClient>;
  chunkSize?: number;
  maxConcurrent?: number;
}

/**
 * Batch fetch data to avoid N+1 query problems
 * @param ids - Array of IDs to fetch
 * @param table - Table name
 * @param foreignKey - Foreign key column name
 * @param columns - Columns to select
 * @param options - Additional options
 * @returns Map of ID to data
 */
export async function batchFetch<T>(
  ids: string[],
  table: string,
  foreignKey: string,
  columns: string = '*',
  options: BatchQueryOptions = {}
): Promise<Map<string, T[]>> {
  const { 
    client = createClient(),
    chunkSize = 100,
    maxConcurrent = 5
  } = options;

  // Deduplicate IDs
  const uniqueIds = [...new Set(ids)];
  
  if (uniqueIds.length === 0) {
    return new Map();
  }

  try {
    // Split IDs into chunks to avoid query parameter limits
    const chunks: string[][] = [];
    for (let i = 0; i < uniqueIds.length; i += chunkSize) {
      chunks.push(uniqueIds.slice(i, i + chunkSize));
    }

    // Process chunks with concurrency limit
    const results: Map<string, T[]> = new Map();
    
    // Process chunks in batches to limit concurrency
    for (let i = 0; i < chunks.length; i += maxConcurrent) {
      const batch = chunks.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(chunk => 
        executeQuery<T[]>(() => 
          client.from(table)
            .select(columns)
            .in(foreignKey, chunk)
        )
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      // Process results from each chunk
      batchResults.forEach((result, index) => {
        if (result.status === 'success' && result.data) {
          // Group results by foreign key
          result.data.forEach((item: any) => {
            const id = item[foreignKey];
            if (!results.has(id)) {
              results.set(id, []);
            }
            results.get(id)!.push(item);
          });
        }
      });
    }
    
    return results;
  } catch (error) {
    captureException('Error in batch fetch', error, { 
      table, 
      foreignKey, 
      idCount: uniqueIds.length 
    });
    return new Map();
  }
}

/**
 * Preload related data for a collection of items to avoid N+1 queries
 * @param items - Array of items
 * @param relations - Configuration for relations to preload
 * @returns Items with preloaded relations
 */
export async function preloadRelations<T extends Record<string, any>>(
  items: T[],
  relations: {
    [key: string]: {
      table: string;
      foreignKey: string;
      localKey?: string;
      columns?: string;
      isArray?: boolean;
    }
  },
  options: BatchQueryOptions = {}
): Promise<T[]> {
  if (items.length === 0) {
    return items;
  }

  try {
    const enhancedItems = [...items];
    
    // Process each relation
    for (const [relationName, config] of Object.entries(relations)) {
      const { 
        table, 
        foreignKey, 
        localKey = 'id', 
        columns = '*',
        isArray = false
      } = config;
      
      // Extract IDs from items
      const ids = items.map(item => item[localKey]).filter(Boolean);
      
      // Batch fetch related data
      const relatedDataMap = await batchFetch(
        ids,
        table,
        foreignKey,
        columns,
        options
      );
      
      // Attach related data to items
      enhancedItems.forEach(item => {
        const id = item[localKey];
        if (id && relatedDataMap.has(id)) {
          const relatedItems = relatedDataMap.get(id) || [];
          
          // Assign as array or single item based on configuration
          if (isArray) {
            item[relationName] = relatedItems;
          } else if (relatedItems.length > 0) {
            item[relationName] = relatedItems[0];
          } else {
            item[relationName] = null;
          }
        } else {
          // Set default value
          item[relationName] = isArray ? [] : null;
        }
      });
    }
    
    return enhancedItems;
  } catch (error) {
    captureException('Error preloading relations', error, { 
      itemCount: items.length,
      relations: Object.keys(relations)
    });
    return items;
  }
}

/**
 * Execute a query with pagination and optimized for performance
 * @param table - Table name
 * @param columns - Columns to select
 * @param options - Query options
 * @returns Paginated results with metadata
 */
export async function paginatedQuery<T>(
  table: string,
  columns: string = '*',
  options: {
    page?: number;
    pageSize?: number;
    filters?: Record<string, any>;
    orderBy?: { column: string, ascending?: boolean };
    relations?: {
      [key: string]: {
        table: string;
        foreignKey: string;
        localKey?: string;
        columns?: string;
        isArray?: boolean;
      }
    };
    client?: ReturnType<typeof createClient>;
    count?: 'exact' | 'planned' | 'estimated';
  } = {}
): Promise<{
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  error: string | null;
}> {
  const { 
    page = 1, 
    pageSize = 10,
    filters = {},
    orderBy,
    relations = {},
    client = createClient(),
    count = 'exact'
  } = options;

  try {
    // Calculate offset
    const offset = (page - 1) * pageSize;
    
    // Build query
    let query = client.from(table).select(columns, { count });
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'object') {
          // Handle range queries
          if ('gt' in value) query = query.gt(key, value.gt);
          if ('gte' in value) query = query.gte(key, value.gte);
          if ('lt' in value) query = query.lt(key, value.lt);
          if ('lte' in value) query = query.lte(key, value.lte);
          if ('not' in value) query = query.not(key, value.not);
          if ('like' in value) query = query.like(key, value.like);
          if ('ilike' in value) query = query.ilike(key, value.ilike);
        } else {
          query = query.eq(key, value);
        }
      }
    });
    
    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }
    
    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);
    
    // Execute query
    const { data, error, count: totalCount } = await query;
    
    if (error) throw error;
    
    // Calculate pagination metadata
    const total = totalCount || 0;
    const totalPages = Math.ceil(total / pageSize);
    
    // Preload relations if needed
    let enhancedData = data as T[];
    if (Object.keys(relations).length > 0 && data && data.length > 0) {
      enhancedData = await preloadRelations(data as any[], relations, { client });
    }
    
    return {
      data: enhancedData,
      page,
      pageSize,
      totalCount: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      error: null
    };
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    captureException('Error in paginated query', errorObj, { 
      table, 
      page, 
      pageSize 
    });
    
    return {
      data: [],
      page,
      pageSize,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      error: errorObj.message
    };
  }
}

/**
 * Create a database function to efficiently fetch related data in a single query
 * This helps avoid N+1 query problems at the database level
 */
export function createEfficientJoinFunction(): string {
  return `
-- Function to efficiently fetch posts with their authors and comments in a single query
create or replace function public.get_posts_with_relations(
  p_limit integer default 10,
  p_offset integer default 0,
  p_user_id uuid default null
)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_result json;
begin
  select json_build_object(
    'posts', (
      select json_agg(
        json_build_object(
          'id', p.id,
          'title', p.title,
          'content', p.content,
          'created_at', p.created_at,
          'updated_at', p.updated_at,
          'author', (
            select json_build_object(
              'id', u.id,
              'name', u.name,
              'avatar_url', u.avatar_url
            )
            from public.profiles u
            where u.id = p.author_id
          ),
          'comments', (
            select json_agg(
              json_build_object(
                'id', c.id,
                'content', c.content,
                'created_at', c.created_at,
                'author', (
                  select json_build_object(
                    'id', cu.id,
                    'name', cu.name,
                    'avatar_url', cu.avatar_url
                  )
                  from public.profiles cu
                  where cu.id = c.author_id
                )
              )
            )
            from public.comments c
            where c.post_id = p.id
            order by c.created_at desc
          ),
          'likes_count', (
            select count(*)
            from public.post_likes pl
            where pl.post_id = p.id
          ),
          'user_has_liked', (
            select exists (
              select 1
              from public.post_likes pl
              where pl.post_id = p.id
              and pl.user_id = p_user_id
            )
          )
        )
      )
      from public.posts p
      order by p.created_at desc
      limit p_limit
      offset p_offset
    ),
    'total_count', (
      select count(*)
      from public.posts
    )
  ) into v_result;
  
  return v_result;
end;
$$;
  `;
}
