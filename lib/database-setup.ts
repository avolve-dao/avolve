import { createClient } from "@/lib/supabase/server"

/**
 * Checks if a table exists in the database
 * @param tableName - Name of the table to check
 * @returns Boolean indicating if the table exists
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Query the information_schema to check if the table exists
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", tableName)
      .single()

    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error)
      return false
    }

    return !!data
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

/**
 * Creates the analytics tables if they don't exist
 * This should be called during app initialization or from an admin page
 */
export async function setupAnalyticsTables(): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Check if the page_views table exists
    const exists = await tableExists("page_views")

    if (exists) {
      return true
    }

    // Create the page_views table
    const { error } = await supabase.rpc("create_analytics_tables")

    if (error) {
      console.error("Error creating analytics tables:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error setting up analytics tables:", error)
    return false
  }
}
