// app/developer-portal/page.tsx
'use client'

import React from 'react';
import Link from 'next/link';

export default function DeveloperPortalPage() {
  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Avolve Developer Portal</h1>
      
      <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-6">
        <h2 className="text-2xl font-semibold mb-4">Build with Avolve</h2>
        <p className="text-muted-foreground mb-4">Integrate with our platform to create transformative experiences for your users. Our APIs provide access to token systems, gamification elements, and user progression data with proper authentication.</p>
        <Link href="/developer-portal/getting-started" className="inline-block text-primary font-medium hover:underline">Get Started →</Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">API Documentation</h2>
          <p className="text-muted-foreground mb-4">Comprehensive guides and references for all Avolve API endpoints.</p>
          <ul className="space-y-2">
            <li><Link href="/developer-portal/api/token" className="text-primary hover:underline">Token Management API</Link></li>
            <li><Link href="/developer-portal/api/quest" className="text-primary hover:underline">Quest & Gamification API</Link></li>
            <li><Link href="/developer-portal/api/user" className="text-primary hover:underline">User Progression API</Link></li>
          </ul>
        </div>
        
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">SDKs & Tools</h2>
          <p className="text-muted-foreground mb-4">Ready-to-use libraries and tools to accelerate your development.</p>
          <ul className="space-y-2">
            <li><Link href="/developer-portal/sdk/javascript" className="text-primary hover:underline">JavaScript/TypeScript SDK</Link></li>
            <li><Link href="/developer-portal/sdk/python" className="text-primary hover:underline">Python SDK</Link></li>
            <li><Link href="/developer-portal/tools/cli" className="text-primary hover:underline">CLI Tools</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication & Security</h2>
        <p className="text-muted-foreground mb-4">Learn how to securely authenticate with our APIs using API keys and OAuth flows. Keep your integration secure with best practices.</p>
        <Link href="/developer-portal/security" className="inline-block text-primary font-medium hover:underline">Security Guidelines →</Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-lg font-medium mb-3">Quick Start Guides</h2>
          <p className="text-sm text-muted-foreground">Get up and running in minutes with our tutorials.</p>
          <Link href="/developer-portal/quickstart" className="inline-block text-primary text-sm hover:underline mt-2">View Guides →</Link>
        </div>
        
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-lg font-medium mb-3">API Status</h2>
          <p className="text-sm text-muted-foreground">Check the current status of our APIs and subscribe to updates.</p>
          <Link href="/developer-portal/status" className="inline-block text-primary text-sm hover:underline mt-2">Check Status →</Link>
        </div>
        
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-lg font-medium mb-3">Community & Support</h2>
          <p className="text-sm text-muted-foreground">Join our developer community or contact support for assistance.</p>
          <Link href="/developer-portal/support" className="inline-block text-primary text-sm hover:underline mt-2">Get Help →</Link>
        </div>
      </div>
      
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Ready to start building?</h2>
        <p className="text-muted-foreground mb-4">Create your developer account to access API keys and start integrating with Avolve.</p>
        <Link href="/developer-portal/signup" className="inline-block py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Sign Up for Developer Access</Link>
      </div>
    </div>
  );
}
