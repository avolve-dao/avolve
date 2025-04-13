import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contribute to Superpuzzle | Avolve',
  description: 'Contribute points to a superpuzzle with your team',
};

export default function ContributeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
