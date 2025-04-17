/**
 * Debug Panel Component
 * 
 * This component provides a developer-only debug panel that displays real-time
 * information about Supabase queries, API latencies, and user session data.
 * 
 * IMPORTANT: This component should only be used in development environments
 * and should never expose sensitive information in production.
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, AlertTriangle, Clock, Database, User, Activity } from 'lucide-react';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { DebugData, DebugQuery } from '@/lib/supabase/types';
import { useFeatureFlags, FEATURE_FLAGS } from '@/lib/feature-flags/feature-flags';

// Types for the debug panel props
export interface DebugPanelProps {
  data: DebugData;
  onClose: () => void;
}

/**
 * Debug Panel Component
 * 
 * Displays debugging information for developers.
 * This component is only rendered in development mode and when the appropriate feature flag is enabled.
 */
const DebugPanel: React.FC<DebugPanelProps> = ({ data, onClose }) => {
  const { supabase } = useSupabase();
  const { isEnabled } = useFeatureFlags();
  const [activeTab, setActiveTab] = useState<'queries' | 'performance' | 'session' | 'state'>('queries');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Helper to get session from supabase
  async function getSessionUser() {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return data.session.user;
  }

  // Check if the current user is authorized to view the debug panel
  useEffect(() => {
    const checkAuthorization = async () => {
      // In development, allow access
      if (process.env.NODE_ENV === 'development') {
        setIsAuthorized(true);
        return;
      }
      
      // In production, only allow access if the user has the appropriate role
      // This would typically check against a list of admin users or roles
      const user = await getSessionUser();
      if (user) {
        // Example: Check if user email is in an allowed list
        const allowedEmails = [
          'admin@avolve.com',
          'founder@avolve.com',
        ];
        
        if (user.email && allowedEmails.includes(user.email)) {
          setIsAuthorized(true);
          return;
        }
        
        // Example: Check if user has metadata indicating they're an admin
        const userMetadata = user.user_metadata;
        if (userMetadata && userMetadata.is_admin === true) {
          setIsAuthorized(true);
          return;
        }
      }
      
      // Not authorized
      setIsAuthorized(false);
    };
    
    checkAuthorization();
  }, [supabase]);

  // Close the panel when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // If not authorized or advanced analytics is disabled, don't render the panel
  if (!isAuthorized || !isEnabled(FEATURE_FLAGS.ADVANCED_ANALYTICS)) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-0 right-0 w-full md:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-t-lg z-50 transition-all duration-300 ease-in-out"
      style={{ maxHeight: '80vh' }}
      ref={panelRef}
      role="dialog"
      aria-labelledby="debug-panel-title"
      aria-describedby="debug-panel-description"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 
          id="debug-panel-title"
          className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center"
        >
          <AlertTriangle size={16} className="mr-2 text-amber-500" />
          Developer Debug Panel
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Close debug panel"
        >
          <X size={18} />
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <TabButton 
          active={activeTab === 'queries'} 
          onClick={() => setActiveTab('queries')}
          icon={<Database size={14} />}
          label="Queries"
        />
        <TabButton 
          active={activeTab === 'performance'} 
          onClick={() => setActiveTab('performance')}
          icon={<Clock size={14} />}
          label="Performance"
        />
        <TabButton 
          active={activeTab === 'session'} 
          onClick={() => setActiveTab('session')}
          icon={<User size={14} />}
          label="Session"
        />
        <TabButton 
          active={activeTab === 'state'} 
          onClick={() => setActiveTab('state')}
          icon={<Activity size={14} />}
          label="State"
        />
      </div>
      
      {/* Content */}
      <div 
        className="overflow-auto p-3"
        style={{ maxHeight: 'calc(80vh - 90px)' }}
        id="debug-panel-description"
      >
        {activeTab === 'queries' && (
          <QueriesTab queries={data.queries} />
        )}
        
        {activeTab === 'performance' && (
          <PerformanceTab performance={data.performance} />
        )}
        
        {activeTab === 'session' && (
          <SessionTab session={data.session} />
        )}
        
        {activeTab === 'state' && (
          <StateTab state={data.state} />
        )}
      </div>
    </div>
  );
};

// Tab button component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    className={`flex items-center px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
      active 
        ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
    }`}
    onClick={onClick}
    aria-selected={active}
    role="tab"
  >
    <span className="mr-1">{icon}</span>
    {label}
  </button>
);

// Queries tab component
interface QueriesTabProps {
  queries: DebugQuery[];
}

const QueriesTab: React.FC<QueriesTabProps> = ({ queries }) => (
  <div>
    <h3 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">Recent Database Queries</h3>
    {queries.length === 0 ? (
      <p className="text-xs text-gray-500 dark:text-gray-400">No queries recorded yet.</p>
    ) : (
      <div className="space-y-2">
        {queries.map((query, index) => (
          <div 
            key={index} 
            className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs border border-gray-200 dark:border-gray-600"
          >
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-200">{query.table}</span>
              <span className={`${
                query.duration > 500 
                  ? 'text-red-500' 
                  : query.duration > 200 
                    ? 'text-amber-500' 
                    : 'text-green-500'
              }`}>
                {query.duration.toFixed(2)}ms
              </span>
            </div>
            <div className="text-gray-600 dark:text-gray-300 break-all">{query.query}</div>
            {query.error && (
              <div className="mt-1 text-red-500 break-all">{query.error}</div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

// Performance tab component
interface PerformanceTabProps {
  performance: Record<string, number>;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ performance }) => (
  <div>
    <h3 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">Performance Metrics</h3>
    {Object.keys(performance).length === 0 ? (
      <p className="text-xs text-gray-500 dark:text-gray-400">No performance metrics recorded yet.</p>
    ) : (
      <div className="space-y-2">
        {Object.entries(performance).map(([key, value], index) => (
          <div 
            key={index} 
            className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs border border-gray-200 dark:border-gray-600"
          >
            <span className="font-medium text-gray-700 dark:text-gray-200">{key}</span>
            <span className={`${
              value > 500 
                ? 'text-red-500' 
                : value > 200 
                  ? 'text-amber-500' 
                  : 'text-green-500'
            }`}>
              {value.toFixed(2)}ms
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Session tab component
interface SessionTabProps {
  session: any;
}

const SessionTab: React.FC<SessionTabProps> = ({ session }) => (
  <div>
    <h3 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">User Session</h3>
    {!session ? (
      <p className="text-xs text-gray-500 dark:text-gray-400">No active session.</p>
    ) : (
      <div className="space-y-2">
        <JsonTree data={session} />
      </div>
    )}
  </div>
);

// State tab component
interface StateTabProps {
  state: any;
}

const StateTab: React.FC<StateTabProps> = ({ state }) => (
  <div>
    <h3 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">Component State</h3>
    {!state ? (
      <p className="text-xs text-gray-500 dark:text-gray-400">No state data available.</p>
    ) : (
      <div className="space-y-2">
        <JsonTree data={state} />
      </div>
    )}
  </div>
);

// JSON tree component for displaying nested objects
interface JsonTreeProps {
  data: any;
  level?: number;
  expanded?: boolean;
}

const JsonTree: React.FC<JsonTreeProps> = ({ data, level = 0, expanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  if (data === null || data === undefined) {
    return <span className="text-gray-500 dark:text-gray-400">null</span>;
  }
  
  if (typeof data !== 'object') {
    if (typeof data === 'string') {
      return <span className="text-green-600 dark:text-green-400">"{data}"</span>;
    }
    if (typeof data === 'number') {
      return <span className="text-blue-600 dark:text-blue-400">{data}</span>;
    }
    if (typeof data === 'boolean') {
      return <span className="text-purple-600 dark:text-purple-400">{data.toString()}</span>;
    }
    return <span>{String(data)}</span>;
  }
  
  const isArray = Array.isArray(data);
  const isEmpty = Object.keys(data).length === 0;
  
  if (isEmpty) {
    return <span className="text-gray-500 dark:text-gray-400">{isArray ? '[]' : '{}'}</span>;
  }
  
  const toggleExpand = () => setIsExpanded(!isExpanded);
  
  return (
    <div className="pl-4 border-l border-gray-200 dark:border-gray-700">
      <div 
        className="flex items-center cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
        onClick={toggleExpand}
      >
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        <span className="ml-1 font-medium">
          {isArray ? `Array(${Object.keys(data).length})` : 'Object'}
        </span>
      </div>
      
      {isExpanded && (
        <div className="mt-1 space-y-1">
          {Object.entries(data).map(([key, value], index) => (
            <div key={index} className="text-xs">
              <div className="flex">
                <span className="font-medium text-gray-600 dark:text-gray-300 mr-2">{key}:</span>
                <JsonTree data={value} level={level + 1} expanded={level < 2} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
