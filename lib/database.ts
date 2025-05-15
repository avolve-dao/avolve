import { createClient } from "@/lib/supabase/server"
import { handleError, ErrorType } from "@/lib/error-handler"
import { measure } from "@/lib/performance"

/**
 * Executes a database query with performance monitoring and error handling
 * @param queryFn - Function that executes the query
 * @param queryName - Name of the query for monitoring
 * @returns Query result
 */
export async function executeQuery<T>(
  queryFn: (supabase: Awaited<ReturnType<typeof createClient>>) => Promise<{ data: T | null; error: any }>,
  queryName: string,
): Promise<T> {
  return measure(async () => {
    try {
      const supabase = await createClient()
      const { data, error } = await queryFn(supabase)

      if (error) {
        throw error
      }

      return data as T
    } catch (error) {
      handleError(error, ErrorType.DATABASE, { action: queryName })
      throw error
    }
  }, `db_query_${queryName}`)
}

/**
 * Executes a database transaction with performance monitoring and error handling
 * @param transactionFn - Function that executes the transaction
 * @param transactionName - Name of the transaction for monitoring
 * @returns Transaction result
 */
export async function executeTransaction<T>(
  transactionFn: (supabase: Awaited<ReturnType<typeof createClient>>) => Promise<T>,
  transactionName: string,
): Promise<T> {
  return measure(async () => {
    try {
      const supabase = await createClient()

      // Start transaction
      await supabase.rpc("begin_transaction")

      try {
        // Execute transaction
        const result = await transactionFn(supabase)

        // Commit transaction
        await supabase.rpc("commit_transaction")

        return result
      } catch (error) {
        // Rollback transaction on error
        await supabase.rpc("rollback_transaction")
        throw error
      }
    } catch (error) {
      handleError(error, ErrorType.DATABASE, { action: transactionName })
      throw error
    }
  }, `db_transaction_${transactionName}`)
}

/**
 * Fetches a single record by ID
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
 * Fetches multiple records with filtering
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

/**
 * Inserts a record
 * @param table - Table name
 * @param data - Record data
 * @returns Inserted record
 */
export async function insertRecord<T>(table: string, data: Record<string, any>): Promise<T> {
  return executeQuery(async (supabase) => {
    return supabase.from(table).insert(data).select().single()
  }, `insert_${table}`)
}

/**
 * Updates a record
 * @param table - Table name
 * @param id - Record ID
 * @param data - Record data
 * @returns Updated record
 */
export async function updateRecord<T>(table: string, id: string, data: Record<string, any>): Promise<T> {
  return executeQuery(async (supabase) => {
    return supabase.from(table).update(data).eq("id", id).select().single()
  }, `update_${table}`)
}

/**
 * Deletes a record
 * @param table - Table name
 * @param id - Record ID
 * @returns Deleted record
 */
export async function deleteRecord<T>(table: string, id: string): Promise<T> {
  return executeQuery(async (supabase) => {
    return supabase.from(table).delete().eq("id", id).select().single()
  }, `delete_${table}`)
}
