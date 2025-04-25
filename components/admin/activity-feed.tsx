import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  created_at: string;
  actor?: {
    name: string;
    avatar_url: string;
  };
  metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
  activity?: ActivityItem[];
}

export function ActivityFeed({ activity = [] }: ActivityFeedProps) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activity.map((item, itemIdx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {itemIdx !== activity.length - 1 ? (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-zinc-800"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                {/* Activity icon */}
                <div
                  className={`
                    relative flex h-10 w-10 items-center justify-center rounded-full
                    ${getActivityColor(item.type)}
                  `}
                >
                  {getActivityIcon(item.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm text-zinc-300">{item.description}</div>
                    <p className="mt-0.5 text-sm text-zinc-400">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <div className="mt-2 rounded-md bg-zinc-800/50 p-2 text-sm text-zinc-300">
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {JSON.stringify(item.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getActivityColor(type: string): string {
  switch (type) {
    case 'user_created':
    case 'user_updated':
      return 'bg-blue-500/10 text-blue-400';
    case 'team_created':
    case 'team_updated':
      return 'bg-purple-500/10 text-purple-400';
    case 'token_minted':
    case 'token_transferred':
      return 'bg-green-500/10 text-green-400';
    case 'security_alert':
    case 'error':
      return 'bg-red-500/10 text-red-400';
    default:
      return 'bg-zinc-500/10 text-zinc-400';
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'user_created':
    case 'user_updated':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      );
    case 'team_created':
    case 'team_updated':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          />
        </svg>
      );
    case 'token_minted':
    case 'token_transferred':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
          />
        </svg>
      );
    case 'security_alert':
    case 'error':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      );
  }
}
