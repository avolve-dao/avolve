import React from 'react';
import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import AssessmentQuestionnaire from '@/components/integration/AssessmentQuestionnaire';
import MainLayout from '@/components/layout/main-layout';

export default function AssessmentPage() {
  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Integration Assessment</h1>
        <p className="text-gray-600 mb-8">
          This assessment will help us understand how well your different domains are integrated.
          Answer honestly to get the most accurate insights about your integration opportunities.
        </p>
        
        <AssessmentQuestionnaire />
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
