import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Superpuzzle Details | Avolve',
  description: 'View superpuzzle details and team contributions',
};

export default function SuperpuzzleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
