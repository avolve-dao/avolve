import { redirect } from 'next/navigation';

/**
 * This page has been replaced with a query parameter approach
 * for better compatibility with Next.js 15.
 * This file simply redirects to the new implementation.
 */
export default function ComponentPageRedirect({
  params,
}: {
  params: {
    pillarSlug: string;
    componentSlug: string;
  };
}) {
  // Redirect to the new component page with query parameters
  redirect(`/dashboard/journey/component?pillarSlug=${params.pillarSlug}&componentSlug=${params.componentSlug}`);
}
