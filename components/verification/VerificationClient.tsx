'use client';

import { HumanVerification } from '@/components/verification/HumanVerification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

interface VerificationClientProps {
  isVerified: boolean;
  memberJourney: {
    current_level: string;
  } | null;
}

export function VerificationClient({ isVerified, memberJourney }: VerificationClientProps) {
  return (
    <>
      <div className="md:col-span-2">
        <HumanVerification requiredScore={100} />
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verification Status</CardTitle>
            <CardDescription>Your current verification level</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`flex items-center gap-2 p-3 rounded-md ${
                isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {isVerified ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Verified Account</p>
                    <p className="text-sm">Your account is fully verified</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Verification Required</p>
                    <p className="text-sm">Complete challenges to verify your account</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why Verify?</CardTitle>
            <CardDescription>Benefits of account verification</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Access to all platform features</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Ability to earn and use tokens</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Participate in community governance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Increased trust score and reputation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Ability to invite others to the platform</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Member Journey</CardTitle>
            <CardDescription>Your progress in the Avolve community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Level</span>
                <span className="text-sm font-medium capitalize">
                  {memberJourney?.current_level || 'Not Started'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full ${memberJourney ? 'bg-primary' : 'bg-muted'}`}
                  />
                  <span className={memberJourney ? 'font-medium' : 'text-muted-foreground'}>
                    Invited
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full ${
                      memberJourney?.current_level === 'vouched' ||
                      memberJourney?.current_level === 'contributor' ||
                      memberJourney?.current_level === 'full_member'
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                  <span
                    className={
                      memberJourney?.current_level === 'vouched' ||
                      memberJourney?.current_level === 'contributor' ||
                      memberJourney?.current_level === 'full_member'
                        ? 'font-medium'
                        : 'text-muted-foreground'
                    }
                  >
                    Vouched
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full ${
                      memberJourney?.current_level === 'contributor' ||
                      memberJourney?.current_level === 'full_member'
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                  <span
                    className={
                      memberJourney?.current_level === 'contributor' ||
                      memberJourney?.current_level === 'full_member'
                        ? 'font-medium'
                        : 'text-muted-foreground'
                    }
                  >
                    Contributor
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full ${
                      memberJourney?.current_level === 'full_member' ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                  <span
                    className={
                      memberJourney?.current_level === 'full_member'
                        ? 'font-medium'
                        : 'text-muted-foreground'
                    }
                  >
                    Full Member
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
