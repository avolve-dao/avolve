interface AdminHeaderProps {
  title: string;
  description?: string;
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-sm text-zinc-400">{description}</p>}
    </div>
  );
}
