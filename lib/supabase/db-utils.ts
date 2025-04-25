import { PostgrestError } from '@supabase/supabase-js';
import { captureException } from '@/lib/monitoring/error-tracking';
import { createClient, withRetry } from './client';

/**
 * Standard response format for database operations
 */
export interface DbResponse<T> {
  data: T | null;
  error: string | null;
  status: 'success' | 'error';
  statusCode?: number;
}

/**
 * Execute a database query with standardized error handling and response format
 * @param queryFn - Function that executes the database query
 * @returns Standardized response object
 */
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<DbResponse<T>> {
  try {
    // Execute the query with retry logic
    const result = await withRetry(queryFn);

    if (result.error) {
      // Log the error
      captureException('Database query error', result.error, {
        query: queryFn.toString(),
        errorCode: result.error.code,
        errorMessage: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
      });

      return {
        data: null,
        error: result.error.message,
        status: 'error',
        statusCode: result.error.code === '23505' ? 409 : // Unique violation
                   result.error.code === '23503' ? 400 : // Foreign key violation
                   result.error.code === '42P01' ? 404 : // Undefined table
                   result.error.code === '42703' ? 400 : // Undefined column
                   result.error.code === '22P02' ? 400 : // Invalid text representation
                   result.error.code === '23502' ? 400 : // Not null violation
                   result.error.code?.startsWith('28') ? 403 : // Permission denied
                   500, // Default to server error
      };
    }

    return {
      data: result.data,
      error: null,
      status: 'success',
      statusCode: 200,
    };
  } catch (error: unknown) {
    // Handle unexpected errors
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    captureException('Unexpected database error', errorObj, {
      query: queryFn.toString(),
    });

    return {
      data: null,
      error: errorObj.message,
      status: 'error',
      statusCode: 500,
    };
  }
}

/**
 * Execute a database insert operation with standardized error handling
 * @param table - Table name
 * @param data - Data to insert
 * @param options - Additional options
 * @returns Standardized response object
 */
export async function insertData<T>(
  table: string,
  data: Record<string, any> | Record<string, any>[],
  options: { 
    returning?: 'minimal' | 'representation',
    client?: ReturnType<typeof createClient>,
    onConflict?: string,
    ignoreDuplicates?: boolean,
  } = {}
): Promise<DbResponse<T>> {
  const { 
    returning = 'representation', 
    client = createClient(),
    onConflict,
    ignoreDuplicates = false,
  } = options;

  return executeQuery<T>(() => {
    let query = client.from(table).insert(data).select();
    
    if (onConflict) {
      query = query.onConflict(onConflict);
    }
    
    if (ignoreDuplicates) {
      query = query.onConflict(onConflict || '').ignore();
    }
    
    return query;
  });
}

/**
 * Execute a database update operation with standardized error handling
 * @param table - Table name
 * @param data - Data to update
 * @param match - Match condition
 * @param options - Additional options
 * @returns Standardized response object
 */
export async function updateData<T>(
  table: string,
  data: Record<string, any>,
  match: Record<string, any>,
  options: {
    returning?: 'minimal' | 'representation',
    client?: ReturnType<typeof createClient>,
  } = {}
): Promise<DbResponse<T>> {
  const { 
    returning = 'representation', 
    client = createClient(),
  } = options;

  return executeQuery<T>(() => {
    let query = client.from(table).update(data).select();
    
    // Apply match conditions
    Object.entries(match).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    return query;
  });
}

/**
 * Execute a database select operation with standardized error handling
 * @param table - Table name
 * @param columns - Columns to select
 * @param match - Match condition
 * @param options - Additional options
 * @returns Standardized response object
 */
export async function selectData<T>(
  table: string,
  columns: string = '*',
  match: Record<string, any> = {},
  options: {
    client?: ReturnType<typeof createClient>,
    single?: boolean,
    limit?: number,
    offset?: number,
    orderBy?: { column: string, ascending?: boolean },
    count?: 'exact' | 'planned' | 'estimated',
  } = {}
): Promise<DbResponse<T>> {
  const { 
    client = createClient(),
    single = false,
    limit,
    offset,
    orderBy,
    count,
  } = options;

  return executeQuery<T>(() => {
    let query = client.from(table).select(columns, { count });
    
    // Apply match conditions
    Object.entries(match).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    // Apply pagination
    if (limit) {
      query = query.limit(limit);
    }
    
    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }
    
    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }
    
    // Return single result if requested
    if (single) {
      query = query.single();
    }
    
    return query;
  });
}

/**
 * Execute a database delete operation with standardized error handling
 * @param table - Table name
 * @param match - Match condition
 * @param options - Additional options
 * @returns Standardized response object
 */
export async function deleteData<T>(
  table: string,
  match: Record<string, any>,
  options: {
    returning?: 'minimal' | 'representation',
    client?: ReturnType<typeof createClient>,
  } = {}
): Promise<DbResponse<T>> {
  const { 
    returning = 'representation', 
    client = createClient(),
  } = options;

  return executeQuery<T>(() => {
    let query = client.from(table).delete().select();
    
    // Apply match conditions
    Object.entries(match).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    return query;
  });
}

/**
 * Execute a raw SQL query with standardized error handling
 * @param sql - SQL query
 * @param params - Query parameters
 * @param options - Additional options
 * @returns Standardized response object
 */
export async function executeRawQuery<T>(
  sql: string,
  params: any[] = [],
  options: {
    client?: ReturnType<typeof createClient>,
  } = {}
): Promise<DbResponse<T>> {
  const { client = createClient() } = options;

  try {
    const { data, error } = await withRetry(() => client.rpc('execute_sql', { 
      p_sql: sql,
      p_params: params,
    }));

    if (error) {
      captureException('Raw SQL query error', error, {
        sql,
        params,
      });

      return {
        data: null,
        error: error.message,
        status: 'error',
        statusCode: 500,
      };
    }

    return {
      data: data as T,
      error: null,
      status: 'success',
      statusCode: 200,
    };
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    captureException('Unexpected raw SQL error', errorObj, {
      sql,
      params,
    });

    return {
      data: null,
      error: errorObj.message,
      status: 'error',
      statusCode: 500,
    };
  }
}
