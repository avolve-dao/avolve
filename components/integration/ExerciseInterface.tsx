import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Database } from '@/types/supabase';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Dumbbell } from 'lucide-react';
import { useTokens } from '@/hooks/use-tokens';

type Exercise = {
  id: string;
  title: string;
  description: string;
  domain: string;
  subdomain: string;
  difficulty: string;
  duration_minutes: number;
  content: {
    steps: string[];
    resources: string[];
  };
  prerequisites: {
    completed_assessment: boolean;
    completed_exercises?: string[];
  };
  outcomes: {
    insights: string[];
  };
};

type ExerciseProgress = {
  id: string;
  status: string;
  progress_data: {
    current_step: number;
    notes: Record<string, string>;
    completed_steps: number[];
  };
  reflection_text: string | null;
  completed_at: string | null;
};

export default function ExerciseInterface({ exerciseId }: { exerciseId: string }) {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const { addTokens } = useTokens();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [progress, setProgress] = useState<ExerciseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('steps');
  const [stepNotes, setStepNotes] = useState<Record<string, string>>({});
  const [reflection, setReflection] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  
  // Fetch exercise and progress
  useEffect(() => {
    async function fetchExerciseData() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch exercise details
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('integration_exercises')
          .select('*')
          .eq('id', exerciseId)
          .single();
        
        if (exerciseError) throw exerciseError;
        setExercise(exerciseData as Exercise);
        
        // Fetch user's progress for this exercise
        const { data: progressData, error: progressError } = await supabase
          .from('user_exercise_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId)
          .single();
        
        if (progressError) {
          if (progressError.code !== 'PGRST116') {
            throw progressError;
          }
          // No progress found, create initial progress
          await initializeProgress();
        } else {
          setProgress(progressData as ExerciseProgress);
          setCurrentStep(progressData.progress_data?.current_step || 0);
          setStepNotes(progressData.progress_data?.notes || {});
          setReflection(progressData.reflection_text || '');
        }
      } catch (error) {
        console.error('Error fetching exercise data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    async function initializeProgress() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.rpc('track_exercise_progress', {
          p_user_id: user.id,
          p_exercise_id: exerciseId,
          p_status: 'in_progress',
          p_progress_data: {
            current_step: 0,
            notes: {},
            completed_steps: []
          }
        });
        
        if (error) throw error;
        
        // Fetch the newly created progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_exercise_progress')
          .select('*')
          .eq('id', data)
          .single();
        
        if (progressError) throw progressError;
        setProgress(progressData as ExerciseProgress);
      } catch (error) {
        console.error('Error initializing progress:', error);
      }
    }
    
    fetchExerciseData();
  }, [supabase, user, exerciseId]);
  
  // Save progress
  const saveProgress = async (newStatus?: string, completedStep?: number) => {
    if (!user || !progress) return;
    
    try {
      setSaving(true);
      
      // Update progress data
      const progressData = {
        ...progress.progress_data,
        current_step: currentStep,
        notes: stepNotes
      };
      
      // Add completed step if provided
      if (completedStep !== undefined) {
        const completedSteps = progress.progress_data?.completed_steps || [];
        if (!completedSteps.includes(completedStep)) {
          progressData.completed_steps = [...completedSteps, completedStep];
        }
      }
      
      const status = newStatus || progress.status;
      
      const { data, error } = await supabase.rpc('track_exercise_progress', {
        p_user_id: user.id,
        p_exercise_id: exerciseId,
        p_status: status,
        p_progress_data: progressData,
        p_reflection_text: reflection
      });
      
      if (error) throw error;
      
      // Fetch updated progress
      const { data: updatedProgress, error: progressError } = await supabase
        .from('user_exercise_progress')
        .select('*')
        .eq('id', data)
        .single();
      
      if (progressError) throw progressError;
      setProgress(updatedProgress as ExerciseProgress);
      
      // Award tokens if exercise is completed
      if (status === 'completed' && progress.status !== 'completed') {
        // Award tokens based on exercise difficulty
        const tokenAmount = exercise?.difficulty === 'advanced' ? 15 : 
                           exercise?.difficulty === 'intermediate' ? 10 : 5;
        
        addTokens('SAP', tokenAmount, `Completed ${exercise?.title} integration exercise`);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleStepNoteChange = (step: number, note: string) => {
    setStepNotes(prev => ({
      ...prev,
      [step]: note
    }));
  };
  
  const handleNextStep = () => {
    if (!exercise) return;
    
    // Save current step as completed
    saveProgress(undefined, currentStep);
    
    // Move to next step if not at the end
    if (currentStep < exercise.content.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // At the last step, show reflection tab
      setActiveTab('reflection');
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleCompleteExercise = async () => {
    if (!reflection.trim()) return;
    
    await saveProgress('completed');
  };
  
  const getDomainColor = (domain: string, subdomain: string) => {
    // Color mapping based on Avolve's domain colors
    const colors: Record<string, Record<string, string>> = {
      personal: {
        health: 'bg-amber-500',
        wealth: 'bg-yellow-500',
        peace: 'bg-amber-300'
      },
      business: {
        users: 'bg-teal-500',
        admin: 'bg-cyan-500',
        profit: 'bg-teal-300'
      },
      supermind: {
        vision: 'bg-violet-500',
        planning: 'bg-purple-500',
        execution: 'bg-fuchsia-500'
      }
    };
    
    return colors[domain]?.[subdomain] || 'bg-gray-500';
  };
  
  const getCompletionPercentage = () => {
    if (!exercise || !progress) return 0;
    
    const totalSteps = exercise.content.steps.length;
    const completedSteps = progress.progress_data?.completed_steps?.length || 0;
    
    return (completedSteps / totalSteps) * 100;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!exercise) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Exercise Not Found</CardTitle>
          <CardDescription>
            The exercise you're looking for doesn't exist or has been removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href="/integration/map">Back to Integration Map</a>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (progress?.status === 'completed') {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{exercise.title}</CardTitle>
              <CardDescription>
                Exercise completed on {new Date(progress.completed_at!).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className={`px-3 py-1 rounded-full text-white text-sm ${getDomainColor(exercise.domain, exercise.subdomain)}`}>
              {exercise.domain} › {exercise.subdomain}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-6">
            <div className="flex flex-col items-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-2" />
              <h3 className="text-xl font-medium">Exercise Completed</h3>
              <p className="text-gray-500 mt-1">Great job integrating this domain!</p>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-slate-50">
            <h3 className="font-medium mb-2">Your Reflection</h3>
            <p className="text-gray-700">{progress.reflection_text}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Key Insights Gained</h3>
            <ul className="list-disc list-inside space-y-1">
              {exercise.outcomes.insights.map((insight, i) => (
                <li key={i} className="text-gray-700">{insight}</li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <a href="/integration/map">Back to Integration Map</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{exercise.title}</CardTitle>
            <CardDescription>{exercise.description}</CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-white text-sm ${getDomainColor(exercise.domain, exercise.subdomain)}`}>
            {exercise.domain} › {exercise.subdomain}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{exercise.duration_minutes} minutes</span>
          </div>
          <div className="flex items-center">
            <Dumbbell className="h-4 w-4 mr-1" />
            <span className="capitalize">{exercise.difficulty}</span>
          </div>
          <div>
            <Progress value={getCompletionPercentage()} className="h-2 w-24" />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="reflection">Reflection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="steps" className="space-y-4 mt-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-4">
                Step {currentStep + 1}: {exercise.content.steps[currentStep]}
              </h3>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Your notes for this step:
                </label>
                <Textarea
                  placeholder="Write your thoughts, observations, and insights here..."
                  value={stepNotes[currentStep] || ''}
                  onChange={(e) => handleStepNoteChange(currentStep, e.target.value)}
                  rows={5}
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 0 || saving}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                
                <Button
                  onClick={handleNextStep}
                  disabled={saving}
                >
                  {currentStep < exercise.content.steps.length - 1 ? (
                    <>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Complete Steps <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {exercise.content.steps.length}
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4 mt-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-4">Resources</h3>
              
              <ul className="space-y-3">
                {exercise.content.resources.map((resource, i) => (
                  <li key={i} className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-white text-xs mr-3 mt-0.5">
                      {i + 1}
                    </div>
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="reflection" className="space-y-4 mt-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-4">Reflect on Your Experience</h3>
              
              <p className="text-gray-600 mb-4">
                Take a moment to reflect on what you've learned through this exercise.
                How has it helped you integrate this domain with others? What insights have you gained?
              </p>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Your reflection:
                </label>
                <Textarea
                  placeholder="Share your thoughts, insights, and how this exercise has impacted your integration journey..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={8}
                  className="w-full"
                />
              </div>
              
              <Button
                className="w-full mt-6"
                onClick={handleCompleteExercise}
                disabled={!reflection.trim() || saving}
              >
                Complete Exercise <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
