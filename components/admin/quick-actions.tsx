import Link from 'next/link'

export function QuickActions() {
  const actions = [
    {
      name: 'Create User',
      href: '/admin/users?action=create',
      description: 'Add a new user account',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      ),
    },
    {
      name: 'New Content',
      href: '/admin/content?action=create',
      description: 'Create new platform content',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Security Check',
      href: '/admin/security?action=check',
      description: 'Run security diagnostics',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      name: 'Export Data',
      href: '/admin/analytics?action=export',
      description: 'Download platform data',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      ),
    },
  ]

  return (
    <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900/50">
      {actions.map((action, actionIdx) => (
        <div
          key={action.name}
          className={`
            ${actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg' : ''}
            ${actionIdx === actions.length - 1 ? 'rounded-bl-lg rounded-br-lg' : ''}
          `}
        >
          <div className="relative group">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50 text-zinc-400">
                    {action.icon}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-zinc-100">
                      {action.name}
                    </div>
                    <div className="text-sm text-zinc-400">
                      {action.description}
                    </div>
                  </div>
                </div>
                <div>
                  <Link
                    href={action.href}
                    className="
                      inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-zinc-100
                      bg-zinc-800/50 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2
                      focus-visible:outline-offset-2 focus-visible:outline-zinc-500
                    "
                  >
                    View
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
