import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/types/database-extensions';

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  token_requirements?: Record<string, number>;
}

/**
 * GET /api/features
 *
 * Returns all features enabled for the current user or all globally enabled features for anonymous users.
 * This endpoint is used by the frontend to determine which features to show.
 *
 * @returns {Object} - Object with enabled features
 */
export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Try to get user (but allow anon)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let features: FeatureFlag[] = [];
    let featuresError: any = null;

    if (user) {
      // Authenticated: fetch personalized feature flags
      const rpcResult = await supabase.rpc('get_enabled_features', { p_user_id: user.id });
      if (rpcResult.error) {
        featuresError = rpcResult.error;
      } else {
        features = (rpcResult.data || []).map((f: any) => ({
          key: f.key,
          name: f.name,
          description: f.description ?? f.name ?? '',
          token_requirements: f.token_requirements ?? {},
        }));
      }
    } else {
      // Anonymous: fetch all globally enabled feature flags
      const result = await supabase
        .from('feature_flags')
        .select('*')
        .eq('enabled', true);
      if (result.error) {
        featuresError = result.error;
      } else {
        features = (result.data || []).map((f: any) => ({
          key: f.key,
          name: f.name,
          description: f.description ?? f.name ?? '',
          token_requirements: f.token_requirements ?? {},
        }));
      }
    }

    if (featuresError) {
      console.error('Error fetching enabled features:', featuresError, JSON.stringify(featuresError), featuresError?.message, featuresError?.code, featuresError?.details, featuresError?.stack);
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch enabled features', details: featuresError },
        { status: 500 }
      );
    }

    // Transform the features array into a more usable format for the frontend
    const enabledFeatures = (features || []).reduce(
      (acc: Record<string, any>, feature: FeatureFlag) => {
        acc[feature.key] = {
          description: feature.description,
          enabled: true,
          tokenRequirements: feature.token_requirements,
        };
        return acc;
      },
      {}
    );

    // Optionally log metrics only for authenticated users
    if (user) {
      try {
        await supabase.from('metrics').insert({
          user_id: user.id,
          metric_type: 'engagement',
          metric_value: 1,
          details: {
            event: 'feature_flags_accessed',
            feature_count: Object.keys(enabledFeatures).length,
          },
        });
      } catch (metricError) {
        console.error('Error recording metric:', metricError);
        // Don't fail the request if metric recording fails
      }
    }

    return NextResponse.json({ features: enabledFeatures });
  } catch (error: any) {
    console.error('Unexpected error in features endpoint:', error, error?.message, error?.stack);
    return NextResponse.json(
      { error: 'Server Error', message: 'An unexpected error occurred', details: error?.message ?? error },
      { status: 500 }
    );
  }
}
