'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getComponentBySlug, getUserComponentProgress, updateComponentProgress } from '@/lib/utils/avolve-db';
import type { Component, UserComponentProgress, JourneyStatus } from '@/lib/types/database.types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ComponentProgressProps {
  componentSlug: string;
  userId: string;
}

interface ProgressFormValues {
  currentState: string;
  desiredState: string;
  actionPlan: string;
  results: string;
  status: JourneyStatus;
}

export function ComponentProgress({ componentSlug, userId }: ComponentProgressProps) {
  const [component, setComponent] = useState<Component | null>(null);
  const [progress, setProgress] = useState<UserComponentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { isDirty } } = useForm<ProgressFormValues>();
  const currentStatus = watch('status');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load component details
        const componentData = await getComponentBySlug(componentSlug);
        setComponent(componentData);
        
        // Load user progress for this component
        try {
          const progressData = await getUserComponentProgress(userId, componentData.id);
          setProgress(progressData);
          
          // Set form values
          setValue('currentState', progressData.current_state ? JSON.stringify(progressData.current_state) : '');
          setValue('desiredState', progressData.desired_state ? JSON.stringify(progressData.desired_state) : '');
          setValue('actionPlan', progressData.action_plan ? JSON.stringify(progressData.action_plan) : '');
          setValue('results', progressData.results ? JSON.stringify(progressData.results) : '');
          setValue('status', progressData.status);
        } catch (err) {
          // If no progress exists yet, set defaults
          setValue('currentState', '');
          setValue('desiredState', '');
          setValue('actionPlan', '');
          setValue('results', '');
          setValue('status', 'not_started');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading component data:', err);
        setError('Failed to load component data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (componentSlug && userId) {
      loadData();
    }
  }, [componentSlug, userId, setValue]);

  const onSubmit = async (data: ProgressFormValues) => {
    try {
      setSaving(true);
      
      // Parse JSON strings to objects, or use empty objects if parsing fails
      let currentState, desiredState, actionPlan, results;
      
      try { currentState = data.currentState ? JSON.parse(data.currentState) : {}; } 
      catch (e) { currentState = { text: data.currentState }; }
      
      try { desiredState = data.desiredState ? JSON.parse(data.desiredState) : {}; } 
      catch (e) { desiredState = { text: data.desiredState }; }
      
      try { actionPlan = data.actionPlan ? JSON.parse(data.actionPlan) : {}; } 
      catch (e) { actionPlan = { text: data.actionPlan }; }
      
      try { results = data.results ? JSON.parse(data.results) : {}; } 
      catch (e) { results = { text: data.results }; }
      
      await updateComponentProgress(
        userId,
        componentSlug,
        data.status,
        currentState,
        desiredState,
        actionPlan,
        results
      );
      
      toast.success('Progress updated successfully');
      
      // Refresh progress data
      if (component) {
        const progressData = await getUserComponentProgress(userId, component.id);
        setProgress(progressData);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.error('Failed to update progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !component) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error || 'Component not found'}</p>
      </div>
    );
  }

  function getStatusBadge(status: JourneyStatus) {
    switch (status) {
      case 'not_started':
        return <Badge variant="outline">Not Started</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{component.title}</CardTitle>
            {component.subtitle && <CardDescription>{component.subtitle}</CardDescription>}
          </div>
          {progress && getStatusBadge(progress.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-6">{component.description || 'No description available'}</p>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="current">Current State</TabsTrigger>
              <TabsTrigger value="desired">Desired State</TabsTrigger>
              <TabsTrigger value="plan">Action Plan</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-4">
              <h3 className="text-lg font-medium">Current State</h3>
              <p className="text-sm text-gray-500">Describe your current situation related to this component.</p>
              <Textarea 
                placeholder="Enter your current state..."
                className="min-h-[200px]"
                {...register('currentState')}
              />
            </TabsContent>
            
            <TabsContent value="desired" className="space-y-4">
              <h3 className="text-lg font-medium">Desired State</h3>
              <p className="text-sm text-gray-500">Describe what you want to achieve with this component.</p>
              <Textarea 
                placeholder="Enter your desired state..."
                className="min-h-[200px]"
                {...register('desiredState')}
              />
            </TabsContent>
            
            <TabsContent value="plan" className="space-y-4">
              <h3 className="text-lg font-medium">Action Plan</h3>
              <p className="text-sm text-gray-500">Outline the steps you'll take to move from current to desired state.</p>
              <Textarea 
                placeholder="Enter your action plan..."
                className="min-h-[200px]"
                {...register('actionPlan')}
              />
            </TabsContent>
            
            <TabsContent value="results" className="space-y-4">
              <h3 className="text-lg font-medium">Results</h3>
              <p className="text-sm text-gray-500">Document the outcomes and results of your actions.</p>
              <Textarea 
                placeholder="Enter your results..."
                className="min-h-[200px]"
                {...register('results')}
              />
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant={currentStatus === 'not_started' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setValue('status', 'not_started', { shouldDirty: true })}
                >
                  Not Started
                </Button>
                <Button 
                  type="button" 
                  variant={currentStatus === 'in_progress' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setValue('status', 'in_progress', { shouldDirty: true })}
                >
                  In Progress
                </Button>
                <Button 
                  type="button" 
                  variant={currentStatus === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setValue('status', 'completed', { shouldDirty: true })}
                >
                  Completed
                </Button>
              </div>
            </div>
            
            <Button type="submit" disabled={saving || !isDirty} className="w-full">
              {saving ? 'Saving...' : 'Save Progress'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-gray-500 w-full">
          {progress?.started_at ? (
            <div className="flex justify-between w-full">
              <span>Started: {new Date(progress.started_at).toLocaleDateString()}</span>
              {progress?.completed_at && (
                <span>Completed: {new Date(progress.completed_at).toLocaleDateString()}</span>
              )}
            </div>
          ) : (
            <span>Not started yet</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
