import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/utils/rate-limit';
import { z } from 'zod';

// Create a rate limiter that allows 5 verification submissions per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute in milliseconds
  limit: 5,
  uniqueTokenPerInterval: 500, // Max number of users per interval
});

// Validation schema for verification submission
const verificationSubmissionSchema = z.object({
  challengeType: z.enum(['puzzle', 'pattern', 'image']),
  challengeId: z.string(),
  challengeData: z.record(z.any()),
  points: z.number().int().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    // Check rate limit
    const { success, remaining } = await limiter.check(ip);

    // If rate limit exceeded, return 429 Too Many Requests
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': remaining.toString(),
            'Retry-After': '60',
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = verificationSubmissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request format', details: result.error.format() },
        { status: 400 }
      );
    }

    const { challengeType, challengeId, challengeData, points } = result.data;
    const supabase = createClient();

    // Get the current user
    const {
      data: { user },
    } = await (supabase as any).auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get current verification status
    const { data: verificationData } = await (supabase as any)
      .from('human_verifications')
      .select('is_verified, verification_data')
      .eq('user_id', user.id)
      .single();

    // If already verified, return success
    if (verificationData?.is_verified) {
      return NextResponse.json({
        success: true,
        message: 'Account already verified',
        isVerified: true,
        score: 100,
      });
    }

    // Calculate new score
    const currentScore = verificationData?.verification_data?.score || 0;
    const newScore = Math.min(currentScore + points, 100);
    const isNowVerified = newScore >= 100;

    // Update verification data
    const { error } = await (supabase as any)
      .from('human_verifications')
      .upsert({
        user_id: user.id,
        verification_method: 'interactive_challenges',
        verification_data: {
          score: newScore,
          challenges_completed: [
            ...(verificationData?.verification_data?.challenges_completed || []),
            challengeType,
          ],
          last_challenge: {
            id: challengeId,
            type: challengeType,
            data: challengeData,
            points,
            timestamp: new Date().toISOString(),
          },
        },
        is_verified: isNowVerified,
        verified_at: isNowVerified ? new Date().toISOString() : null,
      })
      .select();

    if (error) {
      // Log the error
      await (supabase as any).from('security_logs').insert({
        user_id: user.id,
        event_type: 'verification_update_failed',
        severity: 'warning',
        details: {
          error: error.message,
          challengeType,
          challengeId,
        },
      });

      return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 });
    }

    // If newly verified, update trust score and log the event
    if (isNowVerified && !verificationData?.is_verified) {
      // Update trust score
      await (supabase as any).rpc('update_trust_score', {
        p_points: 10,
        p_reason: 'human_verification_completed',
      });

      // Log verification completion
      await (supabase as any).from('security_logs').insert({
        user_id: user.id,
        event_type: 'human_verification_completed',
        severity: 'info',
        details: {
          method: 'interactive_challenges',
          score: newScore,
        },
      });
    } else {
      // Log challenge completion
      await (supabase as any).from('security_logs').insert({
        user_id: user.id,
        event_type: 'verification_challenge_completed',
        severity: 'info',
        details: {
          challengeType,
          challengeId,
          points,
          newScore,
        },
      });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: isNowVerified ? 'Account successfully verified' : 'Challenge completed',
      isVerified: isNowVerified,
      score: newScore,
    });
  } catch (error) {
    console.error('Error in verification submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
