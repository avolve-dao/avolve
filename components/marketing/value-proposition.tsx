import Image from 'next/image';

interface ValuePropositionProps {
  title?: string;
  content?: string;
  sections?: { title: string; content: string }[];
}

const defaultValues = [
  {
    name: 'Individual Growth',
    description:
      'Unlock your highest potential through personalized challenges, AI-powered insights, and proven growth frameworks.',
    icon: (
      <svg
        className="h-6 w-6 text-white"
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
    ),
  },
  {
    name: 'Collective Achievement',
    description:
      'Join forces with like-minded individuals to solve complex challenges and create meaningful impact together.',
    icon: (
      <svg
        className="h-6 w-6 text-white"
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
    ),
  },
  {
    name: 'Ecosystem Evolution',
    description:
      'Participate in building a new kind of civilization based on The Prime Law, shaping the future through governance and innovation.',
    icon: (
      <svg
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    ),
  },
];

export function ValueProposition({ title, content, sections }: ValuePropositionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-zinc-900 py-24 sm:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),theme(colors.zinc.900))] opacity-20" />
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-zinc-900 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50/5 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {title || 'Our Vision'}
          </h2>
          <p className="mt-6 text-lg leading-8 text-zinc-300">
            {content ||
              "We believe in the extraordinary potential within every individual and the transformative power of collective consciousness. Through our platform, we're creating a new paradigm for human evolution."}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          {sections && sections.length > 0 ? (
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {sections.map(section => (
                <div key={section.title} className="flex flex-col">
                  <dt className="text-base font-semibold leading-7 text-white">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                        />
                      </svg>
                    </div>
                    {section.title}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                    <p className="flex-auto">{section.content}</p>
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {defaultValues.map(value => (
                <div key={value.name} className="flex flex-col">
                  <dt className="text-base font-semibold leading-7 text-white">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                      {value.icon}
                    </div>
                    {value.name}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-zinc-300">
                    <p className="flex-auto">{value.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
