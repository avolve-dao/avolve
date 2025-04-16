import Link from 'next/link';

const NAV = [
  {
    label: 'Superachiever',
    href: '/app/(superachiever)/superachiever',
    gradient: 'linear-gradient(90deg, #e6d1b3 0%, #b8a07e 100%)',
  },
  {
    label: 'Superachievers',
    href: '/app/(superachievers)/superachievers',
    gradient: 'linear-gradient(90deg, #cbd5e1 0%, #64748b 100%)',
  },
  {
    label: 'Supercivilization',
    href: '/app/(supercivilization)/supercivilization',
    gradient: 'linear-gradient(90deg, #b6c1d1 0%, #8e99a9 100%)',
  },
];

export default function DashboardNav() {
  return (
    <nav style={{display: 'flex', gap: 18, marginBottom: 28}}>
      {NAV.map(item => (
        <Link key={item.label} href={item.href} legacyBehavior>
          <a style={{
            padding: '0.5rem 1.25rem',
            borderRadius: 8,
            fontWeight: 600,
            color: '#222',
            background: item.gradient,
            textDecoration: 'none',
            boxShadow: '0 1px 4px #e0e0e0',
            transition: 'box-shadow 0.2s',
          }}>{item.label}</a>
        </Link>
      ))}
    </nav>
  );
}
