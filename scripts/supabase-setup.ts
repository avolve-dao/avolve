/**
 * Supabase Setup Script
 *
 * This script verifies and configures your Supabase project for the Super app.
 * It checks authentication settings, database tables, and storage buckets.
 *
 * Usage:
 * 1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 * 2. Run with: npx tsx scripts/supabase-setup.ts
 */

import { createClient } from "@supabase/supabase-js"

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")
  process.exit(1)
}

// Create Supabase admin client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function main() {
  console.log("🔍 Starting Supabase configuration audit...")

  // 1. Check authentication settings
  console.log("\n📋 Checking authentication settings...")

  // Get auth settings
  const { data: authSettings, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error("❌ Error fetching auth settings:", authError.message)
  } else {
    console.log("✅ Successfully connected to Supabase Auth")
  }

  // 2. Check required database tables
  console.log("\n📋 Checking database tables...")

  // List of tables we expect to exist
  const requiredTables = ["users", "profiles", "posts", "comments", "likes", "follows"]

  // Check if tables exist
  const { data: tables, error: tablesError } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")

  if (tablesError) {
    console.error("❌ Error fetching tables:", tablesError.message)
  } else {
    const existingTables = tables.map((t) => t.table_name)
    console.log("📊 Existing tables:", existingTables.join(", "))

    // Check for missing tables
    const missingTables = requiredTables.filter((t) => !existingTables.includes(t))

    if (missingTables.length > 0) {
      console.log("⚠️ Missing tables:", missingTables.join(", "))
      console.log("Creating missing tables...")

      // Create missing tables
      for (const table of missingTables) {
        await createTable(table)
      }
    } else {
      console.log("✅ All required tables exist")
    }
  }

  // 3. Check storage buckets
  console.log("\n📋 Checking storage buckets...")

  const requiredBuckets = ["avatars", "posts", "media"]

  // List buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error("❌ Error fetching storage buckets:", bucketsError.message)
  } else {
    const existingBuckets = buckets.map((b) => b.name)
    console.log("📦 Existing buckets:", existingBuckets.join(", "))

    // Check for missing buckets
    const missingBuckets = requiredBuckets.filter((b) => !existingBuckets.includes(b))

    if (missingBuckets.length > 0) {
      console.log("⚠️ Missing buckets:", missingBuckets.join(", "))
      console.log("Creating missing buckets...")

      // Create missing buckets
      for (const bucket of missingBuckets) {
        const { data, error } = await supabase.storage.createBucket(bucket, {
          public: bucket === "avatars" || bucket === "posts",
          fileSizeLimit: bucket === "media" ? 50 * 1024 * 1024 : 10 * 1024 * 1024, // 50MB for media, 10MB for others
        })

        if (error) {
          console.error(`❌ Error creating bucket ${bucket}:`, error.message)
        } else {
          console.log(`✅ Created bucket: ${bucket}`)
        }
      }
    } else {
      console.log("✅ All required buckets exist")
    }
  }

  // 4. Check and update site URL in auth settings
  console.log("\n📋 Checking site URL configuration...")

  // This would require Supabase Management API which isn't available in this context
  // In a real implementation, you would use the Supabase Management API to update the site URL
  console.log("⚠️ Please manually verify the Site URL in Supabase Dashboard:")
  console.log("   1. Go to Authentication > URL Configuration")
  console.log("   2. Ensure Site URL is set to your production URL (e.g., https://v0-super.vercel.app)")
  console.log("   3. Ensure Redirect URLs include your callback path (e.g., https://v0-super.vercel.app/auth/callback)")

  console.log("\n✅ Supabase configuration audit completed!")
}

async function createTable(tableName: string) {
  let query = ""

  switch (tableName) {
    case "profiles":
      query = `
        CREATE TABLE profiles (
          id UUID REFERENCES auth.users(id) PRIMARY KEY,
          full_name TEXT,
          username TEXT UNIQUE,
          avatar_url TEXT,
          bio TEXT,
          website TEXT,
          location TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Set up Row Level Security (RLS)
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Public profiles are viewable by everyone"
          ON profiles FOR SELECT
          USING (true);
          
        CREATE POLICY "Users can insert their own profile"
          ON profiles FOR INSERT
          WITH CHECK (auth.uid() = id);
          
        CREATE POLICY "Users can update their own profile"
          ON profiles FOR UPDATE
          USING (auth.uid() = id);
      `
      break

    case "posts":
      query = `
        CREATE TABLE posts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          content TEXT NOT NULL,
          media_urls TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Set up Row Level Security (RLS)
        ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Posts are viewable by everyone"
          ON posts FOR SELECT
          USING (true);
          
        CREATE POLICY "Users can insert their own posts"
          ON posts FOR INSERT
          WITH CHECK (auth.uid() = user_id);
          
        CREATE POLICY "Users can update their own posts"
          ON posts FOR UPDATE
          USING (auth.uid() = user_id);
          
        CREATE POLICY "Users can delete their own posts"
          ON posts FOR DELETE
          USING (auth.uid() = user_id);
      `
      break

    case "comments":
      query = `
        CREATE TABLE comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Set up Row Level Security (RLS)
        ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Comments are viewable by everyone"
          ON comments FOR SELECT
          USING (true);
          
        CREATE POLICY "Users can insert their own comments"
          ON comments FOR INSERT
          WITH CHECK (auth.uid() = user_id);
          
        CREATE POLICY "Users can update their own comments"
          ON comments FOR UPDATE
          USING (auth.uid() = user_id);
          
        CREATE POLICY "Users can delete their own comments"
          ON comments FOR DELETE
          USING (auth.uid() = user_id);
      `
      break

    case "likes":
      query = `
        CREATE TABLE likes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
          comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT likes_post_or_comment CHECK (
            (post_id IS NULL AND comment_id IS NOT NULL) OR
            (post_id IS NOT NULL AND comment_id IS NULL)
          ),
          CONSTRAINT likes_unique_post UNIQUE (post_id, user_id),
          CONSTRAINT likes_unique_comment UNIQUE (comment_id, user_id)
        );
        
        -- Set up Row Level Security (RLS)
        ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Likes are viewable by everyone"
          ON likes FOR SELECT
          USING (true);
          
        CREATE POLICY "Users can insert their own likes"
          ON likes FOR INSERT
          WITH CHECK (auth.uid() = user_id);
          
        CREATE POLICY "Users can delete their own likes"
          ON likes FOR DELETE
          USING (auth.uid() = user_id);
      `
      break

    case "follows":
      query = `
        CREATE TABLE follows (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          follower_id UUID REFERENCES auth.users(id) NOT NULL,
          following_id UUID REFERENCES auth.users(id) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT follows_unique UNIQUE (follower_id, following_id),
          CONSTRAINT follows_not_self CHECK (follower_id != following_id)
        );
        
        -- Set up Row Level Security (RLS)
        ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Follows are viewable by everyone"
          ON follows FOR SELECT
          USING (true);
          
        CREATE POLICY "Users can follow others"
          ON follows FOR INSERT
          WITH CHECK (auth.uid() = follower_id);
          
        CREATE POLICY "Users can unfollow others"
          ON follows FOR DELETE
          USING (auth.uid() = follower_id);
      `
      break

    default:
      console.log(`⚠️ No schema defined for table: ${tableName}`)
      return
  }

  const { error } = await supabase.rpc("exec_sql", { query })

  if (error) {
    console.error(`❌ Error creating table ${tableName}:`, error.message)
  } else {
    console.log(`✅ Created table: ${tableName}`)
  }
}

main().catch((err) => {
  console.error("❌ Script failed with error:", err)
  process.exit(1)
})

