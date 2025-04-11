'use client';

import { RedocStandalone } from 'redoc';

export default function APIPlayground() {
  return (
    <div className="min-h-screen">
      <RedocStandalone
        specUrl="/api/openapi.json"
        options={{
          nativeScrollbars: true,
          theme: {
            colors: {
              primary: {
                main: '#2563eb'
              }
            },
            typography: {
              fontFamily: 'var(--font-sans)',
              headings: {
                fontFamily: 'var(--font-sans)'
              }
            }
          }
        }}
      />
    </div>
  );
}
