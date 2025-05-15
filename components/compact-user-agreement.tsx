"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CURRENT_AGREEMENT_VERSION } from "@/constants"

interface CompactUserAgreementProps {
  onAccept: () => void
  onDecline: () => void
  loading?: boolean
  className?: string
}

export function CompactUserAgreement({
  onAccept,
  onDecline,
  loading = false,
  className = "",
}: CompactUserAgreementProps) {
  const [hasRead, setHasRead] = React.useState(false)

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Supercivilization Agreement</CardTitle>
        <CardDescription>Version {CURRENT_AGREEMENT_VERSION} • Please review before continuing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
          <p>
            By joining Avolve, you're becoming part of the Supercivilization movement - a community dedicated to
            transforming from Degen to Regen mentality and creating positive-sum value.
          </p>

          <h3 className="font-semibold mt-3">Core Principles</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Value creation over value extraction</li>
            <li>Self-leadership and integrated thinking</li>
            <li>Positive-sum collaboration</li>
            <li>Personal and collective transformation</li>
          </ul>

          <h3 className="font-semibold mt-3">Your Commitment</h3>
          <p>As a member, you agree to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Engage respectfully with all community members</li>
            <li>Contribute positively to discussions and activities</li>
            <li>Uphold the values of the Supercivilization</li>
            <li>Work toward personal growth and transformation</li>
          </ul>

          <h3 className="font-semibold mt-3">Token System</h3>
          <p>
            The GEN token and related tokens represent your contribution to and participation in the Supercivilization.
            These tokens are not financial instruments but rather recognition of your journey and value creation.
          </p>
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="agreement-checkbox"
            checked={hasRead}
            onCheckedChange={(checked) => setHasRead(checked === true)}
          />
          <label
            htmlFor="agreement-checkbox"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have read and agree to the Supercivilization Agreement
          </label>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onDecline} disabled={loading}>
          Decline
        </Button>
        <Button onClick={onAccept} disabled={!hasRead || loading}>
          {loading ? "Processing..." : "Accept & Continue"}
        </Button>
      </CardFooter>
    </Card>
  )
}
