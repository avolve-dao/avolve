'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface RouteMapping {
  [key: string]: {
    label: string;
    parent?: string;
    dynamicFetch?: {
      table: string;
      column: string;
      idParam: string;
      labelColumn: string;
    };
  };
}

// Define route mappings for breadcrumbs
const routeMapping: RouteMapping = {
  dashboard: { label: 'Dashboard' },
  journey: { label: 'Journey', parent: 'dashboard' },
  teams: { label: 'Teams' },
  messages: { label: 'Messages' },
  group: { label: 'Group Chat', parent: 'messages' },
  superpuzzles: { label: 'Superpuzzles' },
  contribute: { label: 'Contribute', parent: 'superpuzzles' },
  tokens: { label: 'Tokens' },
  governance: { label: 'Governance' },
  profile: { label: 'Profile', parent: 'dashboard' },
  settings: { label: 'Settings' },
  verification: { label: 'Verification', parent: 'dashboard' },
  discover: { label: 'Discover', parent: 'dashboard' },
  activity: { label: 'Activity', parent: 'dashboard' },
  achievements: { label: 'Achievements', parent: 'dashboard' },
  analytics: { label: 'Analytics', parent: 'dashboard' },
  membership: { label: 'Membership', parent: 'dashboard' },
  
  // Dynamic routes with database lookups
  '[pillarSlug]': { 
    label: 'Pillar', 
    parent: 'journey',
    dynamicFetch: {
      table: 'pillars',
      column: 'slug',
      idParam: 'pillarSlug',
      labelColumn: 'name'
    }
  },
  '[componentSlug]': { 
    label: 'Component', 
    parent: '[pillarSlug]',
    dynamicFetch: {
      table: 'components',
      column: 'slug',
      idParam: 'componentSlug',
      labelColumn: 'name'
    }
  },
  '[id]': { 
    label: 'Details', 
    dynamicFetch: {
      table: 'superpuzzles',
      column: 'id',
      idParam: 'id',
      labelColumn: 'title'
    }
  },
  '[chatId]': { 
    label: 'Chat', 
    parent: 'messages',
    dynamicFetch: {
      table: 'chats',
      column: 'id',
      idParam: 'chatId',
      labelColumn: 'name'
    }
  },
  '[groupId]': { 
    label: 'Group', 
    parent: 'group',
    dynamicFetch: {
      table: 'chat_groups',
      column: 'id',
      idParam: 'groupId',
      labelColumn: 'name'
    }
  },
};

interface BreadcrumbItem {
  href: string;
  label: string;
  isLast: boolean;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function generateBreadcrumbs() {
      if (!pathname) return;
      
      const pathSegments = pathname.split('/').filter(Boolean);
      const breadcrumbItems: BreadcrumbItem[] = [];
      let currentPath = '';
      
      // Add home breadcrumb
      breadcrumbItems.push({
        href: '/dashboard',
        label: 'Home',
        isLast: pathSegments.length === 0
      });
      
      // Process each path segment
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        currentPath += `/${segment}`;
        
        // Check if this is a dynamic segment
        const isDynamic = segment.match(/^\[.*\]$/) || 
                          Object.keys(routeMapping).some(key => {
                            const dynamicKey = key.match(/^\[.*\]$/);
                            return dynamicKey && segment.match(/^[a-zA-Z0-9-_]+$/);
                          });
        
        let label = '';
        
        // Handle dynamic segments
        if (isDynamic) {
          // Find the matching dynamic route mapping
          const dynamicKey = Object.keys(routeMapping).find(key => key.match(/^\[.*\]$/));
          
          if (dynamicKey && routeMapping[dynamicKey]?.dynamicFetch) {
            const { table, column, idParam, labelColumn } = routeMapping[dynamicKey].dynamicFetch!;
            
            // Fetch the label from the database
            const { data, error } = await supabase
              .from(table)
              .select(labelColumn)
              .eq(column, segment)
              .single();
            
            if (data && !error) {
              label = data[labelColumn];
            } else {
              label = segment.charAt(0).toUpperCase() + segment.slice(1);
            }
          } else {
            label = segment.charAt(0).toUpperCase() + segment.slice(1);
          }
        } 
        // Handle static segments
        else if (routeMapping[segment]) {
          label = routeMapping[segment].label;
        } 
        // Default label
        else {
          label = segment.charAt(0).toUpperCase() + segment.slice(1);
        }
        
        breadcrumbItems.push({
          href: currentPath,
          label,
          isLast: i === pathSegments.length - 1
        });
      }
      
      setBreadcrumbs(breadcrumbItems);
    }
    
    generateBreadcrumbs();
  }, [pathname, supabase]);
  
  if (breadcrumbs.length <= 1) return null;
  
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
            
            {index === 0 ? (
              <Link 
                href={breadcrumb.href}
                className="flex items-center hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            ) : breadcrumb.isLast ? (
              <span className="font-medium text-foreground">{breadcrumb.label}</span>
            ) : (
              <Link 
                href={breadcrumb.href}
                className="hover:text-foreground transition-colors"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
