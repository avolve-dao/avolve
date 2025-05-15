import { createClient } from "@/lib/supabase/server"

/**
 * Executes a database query with performance monitoring and error handling
 * @param queryFn - Function that executes the query
 * @param queryName - Name of the query for monitoring
 * @returns Query result
 */
export async function executeQuery<T>(
  queryFn: (supabase: ReturnType<typeof createClient>) => Promise<{ data: T | null; error: any }>,
  queryName: string,
): Promise<T> {
  const startTime = performance.now()

  try {
    const supabase = createClient()
    const { data, error } = await queryFn(supabase)

    if (error) {
      throw error
    }

    const endTime = performance.now()
    console.log(`Query ${queryName} took ${endTime - startTime}ms`)

    return data as T
  } catch (error) {
    console.error(`Error in query ${queryName}:`, error)
    throw error
  }
}

/**
 * Fetches a single record by ID with caching
 * @param table - Table name
 * @param id - Record ID
 * @param columns - Columns to select
 * @returns Record data
 */
export async function fetchById<T>(table: string, id: string, columns = "*"): Promise<T> {
  return executeQuery(async (supabase) => {
    return supabase.from(table).select(columns).eq("id", id).single()
  }, `fetch_${table}_by_id`)
}

/**
 * Fetches multiple records with filtering and pagination
 * @param table - Table name
 * @param filters - Filter conditions
 * @param options - Query options
 * @returns Records data
 */
export async function fetchMany<T>(
  table: string,
  filters: Record<string, any> = {},
  options: {
    columns?: string
    limit?: number
    offset?: number
    orderBy?: string
    orderDirection?: "asc" | "desc"
  } = {},
): Promise<T[]> {
  const { columns = "*", limit = 100, offset = 0, orderBy = "created_at", orderDirection = "desc" } = options

  return executeQuery(async (supabase) => {
    let query = supabase
      .from(table)
      .select(columns)
      .order(orderBy, { ascending: orderDirection === "asc" })
      .limit(limit)
      .offset(offset)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })

    return query
  }, `fetch_${table}_many`)
}
