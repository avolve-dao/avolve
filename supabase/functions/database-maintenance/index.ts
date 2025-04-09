// Supabase Edge Function for Database Maintenance
// This function runs daily to perform database maintenance tasks:
// 1. Archive old transactions (older than 90 days)
// 2. Clean up expired invitation codes
// 3. Create new transaction partitions as needed
// 4. Collect database performance metrics
// 5. Refresh materialized views

// @ts-ignore: Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno imports
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface MaintenanceRequest {
  days_old?: number;
  auth_key: string;
  tasks?: string[]; // Optional array of specific tasks to run
}

interface MaintenanceResponse {
  success: boolean;
  maintenance_results?: Record<string, unknown>;
  health_report?: Record<string, unknown>;
  execution_time_ms?: number;
  error?: string;
  timestamp: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Logger for structured logging
const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: "info",
      message,
      ...data,
      timestamp: new Date().toISOString(),
    }));
  },
  error: (message: string, error?: Error, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: "error",
      message,
      error: error ? { message: error.message, stack: error.stack } : undefined,
      ...data,
      timestamp: new Date().toISOString(),
    }));
  }
};

// Rate limiting implementation
const rateLimiter = {
  ipMap: new Map<string, { count: number, timestamp: number }>(),
  
  checkLimit: (ip: string, limit = 5, windowMs = 60000): boolean => {
    const now = Date.now();
    const record = rateLimiter.ipMap.get(ip);
    
    // Clean up old records every 10 minutes
    if (now % 600000 < 1000) {
      rateLimiter.cleanup(now - windowMs);
    }
    
    if (!record) {
      rateLimiter.ipMap.set(ip, { count: 1, timestamp: now });
      return true;
    }
    
    if (now - record.timestamp > windowMs) {
      // Reset if outside window
      record.count = 1;
      record.timestamp = now;
      return true;
    }
    
    if (record.count >= limit) {
      return false; // Rate limited
    }
    
    record.count++;
    return true;
  },
  
  cleanup: (olderThan: number) => {
    for (const [ip, record] of rateLimiter.ipMap.entries()) {
      if (record.timestamp < olderThan) {
        rateLimiter.ipMap.delete(ip);
      }
    }
  }
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  // Get client IP for rate limiting
  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
  
  // Check rate limit
  if (!rateLimiter.checkLimit(clientIp)) {
    logger.info("Rate limit exceeded", { clientIp });
    return new Response(
      JSON.stringify({
        success: false,
        message: "Rate limit exceeded. Please try again later.",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      }
    );
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient: SupabaseClient = createClient(
      // @ts-ignore: Deno env
      Deno.env.get("SUPABASE_URL") ?? "",
      // @ts-ignore: Deno env
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
        auth: {
          persistSession: false,
        },
      }
    );

    // Parse request to get parameters
    const { days_old = 90, auth_key, tasks = [] }: MaintenanceRequest = await req.json();

    // Authentication check using JWT validation instead of simple key
    try {
      // Verify JWT token
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        // Fall back to API key authentication if JWT is invalid
        // @ts-ignore: Deno env
        const expected_key = Deno.env.get("MAINTENANCE_AUTH_KEY");
        if (auth_key !== expected_key) {
          logger.error("Unauthorized access attempt", undefined, { clientIp });
          return new Response(
            JSON.stringify({ success: false, error: "Unauthorized", timestamp: new Date().toISOString() }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 401,
            }
          );
        }
      } else {
        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabaseClient
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        if (roleError || roleData?.role !== 'admin') {
          logger.error("Unauthorized access attempt", undefined, { userId: user.id, clientIp });
          return new Response(
            JSON.stringify({ success: false, error: "Unauthorized", timestamp: new Date().toISOString() }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 401,
            }
          );
        }
      }
    } catch (authError) {
      logger.error("Authentication error", authError as Error, { clientIp });
      return new Response(
        JSON.stringify({ success: false, error: "Authentication error", timestamp: new Date().toISOString() }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Start time for performance tracking
    const startTime = new Date();
    logger.info("Starting database maintenance", { days_old, tasks });

    const response: MaintenanceResponse = {
      success: true,
      timestamp: new Date().toISOString(),
    };

    // Run the database maintenance function
    if (tasks.length === 0 || tasks.includes("maintenance")) {
      const { data, error } = await supabaseClient.rpc(
        "run_database_maintenance",
        { p_days_old: days_old }
      );

      if (error) {
        throw error;
      }
      
      response.maintenance_results = data;
    }

    // Collect database metrics
    if (tasks.length === 0 || tasks.includes("metrics")) {
      await supabaseClient.rpc("collect_database_metrics");
    }

    // Refresh materialized views
    if (tasks.length === 0 || tasks.includes("refresh_views")) {
      await supabaseClient.rpc("refresh_materialized_views");
    }

    // Generate a health report
    if (tasks.length === 0 || tasks.includes("health_report")) {
      const { data: reportData, error: reportError } = await supabaseClient.rpc(
        "generate_database_health_report",
        { p_hours_back: 24 }
      );

      if (reportError) {
        logger.error("Error generating health report", reportError as Error);
      } else {
        response.health_report = reportData;
      }
    }

    // Calculate execution time
    const endTime = new Date();
    const executionTime = endTime.getTime() - startTime.getTime();
    response.execution_time_ms = executionTime;
    
    logger.info("Database maintenance completed", { 
      executionTime,
      tasksRun: tasks.length === 0 ? ["all"] : tasks
    });

    // Return the results
    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    const error = err as Error;
    logger.error("Error running maintenance", error, { clientIp });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
