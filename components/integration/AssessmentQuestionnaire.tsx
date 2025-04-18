import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Database } from '@/types/supabase';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useTokens } from '@/hooks/use-tokens';

type Question = {
  id: string;
  domain: string;
  subdomain: string;
  question_text: string;
  question_type: string;
  options: any;
  weight: number;
};

type Response = {
  question_id: string;
  response_value: any;
};

export default function AssessmentQuestionnaire() {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const { addTokens } = useTokens();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Fetch questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('integration_assessment_questions')
          .select('*')
          .order('domain', { ascending: true })
          .order('subdomain', { ascending: true });

        if (error) throw error;
        setQuestions(data || []);

        // Check if user has existing responses
        if (user) {
          const { data: responseData, error: responseError } = await supabase
            .from('integration_assessment_responses')
            .select('question_id, response_value')
            .eq('user_id', user.id);

          if (responseError) throw responseError;
          
          const responseMap: Record<string, any> = {};
          responseData?.forEach((response: Response) => {
            responseMap[response.question_id] = response.response_value;
          });
          setResponses(responseMap);

          // Check if assessment is already completed
          const { data: profileData, error: profileError } = await supabase
            .from('integration_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') throw profileError;
          
          if (profileData && profileData.assessment_completed) {
            setCompleted(true);
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error fetching assessment data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [supabase, user]);

  // Save response and update profile
  const saveResponse = async (questionId: string, value: any) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { data, error } = await supabase.rpc('save_assessment_response', {
        p_user_id: user.id,
        p_question_id: questionId,
        p_response_value: { value }
      });

      if (error) throw error;
      
      // Update local responses
      setResponses(prev => ({
        ...prev,
        [questionId]: { value }
      }));

      // Check if all questions are answered
      const { data: profileData, error: profileError } = await supabase
        .from('integration_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      
      if (profileData.assessment_completed) {
        setCompleted(true);
        setProfile(profileData);
        
        // Award tokens for completing assessment
        addTokens('SAP', 10, 'Completed integration assessment');
      }
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (!questions[currentQuestionIndex]) return;
    
    const questionId = questions[currentQuestionIndex].id;
    saveResponse(questionId, value[0]);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getCurrentResponse = () => {
    if (!questions[currentQuestionIndex]) return null;
    
    const questionId = questions[currentQuestionIndex].id;
    return responses[questionId]?.value || null;
  };

  const getProgressPercentage = () => {
    const answeredCount = Object.keys(responses).length;
    return questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (completed && profile) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Assessment Complete</CardTitle>
          <CardDescription>
            Thank you for completing the integration assessment! Here are your results:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm">Personal Health</p>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-2 bg-amber-500 rounded-full" 
                  style={{ width: `${typeof profile.personal_health_score === 'number' ? profile.personal_health_score * 10 : 0}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">{typeof profile.personal_health_score === 'number' ? profile.personal_health_score.toFixed(1) : 'N/A'}/10</p>
            </div>
            <div>
              <p className="text-sm">Personal Wealth</p>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-2 bg-yellow-500 rounded-full" 
                  style={{ width: `${typeof profile.personal_wealth_score === 'number' ? profile.personal_wealth_score * 10 : 0}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">{typeof profile.personal_wealth_score === 'number' ? profile.personal_wealth_score.toFixed(1) : 'N/A'}/10</p>
            </div>
            <div>
              <p className="text-sm">Personal Peace</p>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-2 bg-amber-300 rounded-full" 
                  style={{ width: `${typeof profile.personal_peace_score === 'number' ? profile.personal_peace_score * 10 : 0}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">{typeof profile.personal_peace_score === 'number' ? profile.personal_peace_score.toFixed(1) : 'N/A'}/10</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <p className="text-sm">Business Users</p>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-2 bg-teal-500 rounded-full" 
                  style={{ width: `${typeof profile.business_users_score === 'number' ? profile.business_users_score * 10 : 0}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">{typeof profile.business_users_score === 'number' ? profile.business_users_score.toFixed(1) : 'N/A'}/10</p>
            </div>
            <div>
              <p className="text-sm">Business Admin</p>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-2 bg-cyan-500 rounded-full" 
                  style={{ width: `${typeof profile.business_admin_score === 'number' ? profile.business_admin_score * 10 : 0}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">{typeof profile.business_admin_score === 'number' ? profile.business_admin_score.toFixed(1) : 'N/A'}/10</p>
            </div>
            <div>
              <p className="text-sm">Business Profit</p>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-2 bg-cyan-400 rounded-full" 
                  style={{ width: `${typeof profile.business_profit_score === 'number' ? profile.business_profit_score * 10 : 0}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">{typeof profile.business_profit_score === 'number' ? profile.business_profit_score.toFixed(1) : 'N/A'}/10</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <p className="text-sm">Supermind Vision</p>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-2 bg-violet-500 rounded-full" 
                  style={{ width: `${typeof profile.supermind_vision_score === 'number' ? profile.supermind_vision_score * 10 : 0}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">{typeof profile.supermind_vision_score === 'number' ? profile.supermind_vision_score.toFixed(1) : 'N/A'}/10</p>
            </div>
            <div>
              <p className="text-sm">Supermind Planning</p>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-2 bg-purple-500 rounded-full" 
                  style={{ width: `${typeof profile.supermind_planning_score === 'number' ? profile.supermind_planning_score * 10 : 0}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">{typeof profile.supermind_planning_score === 'number' ? profile.supermind_planning_score.toFixed(1) : 'N/A'}/10</p>
            </div>
            <div>
              <p className="text-sm">Supermind Execution</p>
              <div className="h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-2 bg-fuchsia-500 rounded-full" 
                  style={{ width: `${typeof profile.supermind_execution_score === 'number' ? profile.supermind_execution_score * 10 : 0}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">{typeof profile.supermind_execution_score === 'number' ? profile.supermind_execution_score.toFixed(1) : 'N/A'}/10</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <a href="/integration/map">View Your Integration Map</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>No Assessment Questions Found</CardTitle>
          <CardDescription>
            Please check back later when our assessment is ready.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentValue = getCurrentResponse();

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Integration Assessment</CardTitle>
            <CardDescription>
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-white text-sm ${getDomainColor(currentQuestion.domain, currentQuestion.subdomain)}`}>
            {currentQuestion.domain} › {currentQuestion.subdomain}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={getProgressPercentage()} className="w-full" />
        
        <div className="py-4">
          <h3 className="text-xl font-medium mb-6">{currentQuestion.question_text}</h3>
          
          {currentQuestion.question_type === 'scale' && (
            <div className="px-4">
              <div className="flex justify-between mb-2 text-sm text-gray-500">
                <span>Low</span>
                <span>High</span>
              </div>
              <Slider
                defaultValue={currentValue ? [currentValue] : [5]}
                min={1}
                max={10}
                step={1}
                onValueCommit={handleSliderChange}
                disabled={saving}
              />
              <div className="flex justify-between mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <span key={num} className="text-xs">{num}</span>
                ))}
              </div>
              <div className="text-center mt-6">
                <span className="text-2xl font-bold">
                  {currentValue || '–'}
                </span>
                <span className="text-gray-500 ml-1">/10</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0 || saving}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        <Button
          onClick={goToNextQuestion}
          disabled={!currentValue || saving}
        >
          {currentQuestionIndex < questions.length - 1 ? (
            <>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Complete <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
