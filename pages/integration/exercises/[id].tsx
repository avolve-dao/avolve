import React from 'react';
import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import ExerciseInterface from '@/components/integration/ExerciseInterface';
import MainLayout from '@/components/layout/main-layout';

interface ExercisePageProps {
  exerciseId: string;
}

export default function ExercisePage({ exerciseId }: ExercisePageProps) {
  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Integration Exercise</h1>
        <p className="text-gray-600 mb-8">
          This guided exercise will help you strengthen the integration between domains,
          creating a more cohesive and powerful transformation journey.
        </p>
        
        <ExerciseInterface exerciseId={exerciseId} />
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
    
  // Get the exercise ID from the URL
  const { id } = ctx.params || {};
  
  if (!id || typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      exerciseId: id,
    },
  };
};
