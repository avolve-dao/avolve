import React from 'react';
import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import IntegrationMap from '@/components/integration/IntegrationMap';
import MainLayout from '@/components/layout/main-layout';

export default function MapPage() {
  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Integration Map</h1>
        <p className="text-gray-600 mb-8">
          Your personalized integration map shows how your different domains are connected
          and where you have opportunities for greater integration.
        </p>
        
        <IntegrationMap />
      </div>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Create authenticated Supabase client
  const supabase = createServerSupabaseClient(ctx);
  
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };

  return {
    props: {},
  };
};
