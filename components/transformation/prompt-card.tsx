'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSupabase } from '@/lib/supabase/supabase-provider';
import { toast } from 'sonner';
import { journeyThemes, type JourneyTheme } from '@/lib/styles/journey-themes';

interface PromptCardProps {
  theme: JourneyTheme;
  prompts: string[];
  className?: string;
}

export function PromptCard({ theme, prompts, className }: PromptCardProps) {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();
  const themeConfig = journeyThemes[theme];

  const generatePrompt = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-prompt', {
        body: { theme },
      });

      if (error) throw error;

      toast.success('Generated a new prompt for you!');
      setCurrentPrompt(prev => (prev + 1) % prompts.length);
    } catch (error) {
      console.error('Error generating prompt:', error);
      // Fallback to cycling through static prompts
      setCurrentPrompt(prev => (prev + 1) % prompts.length);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className={cn('absolute inset-0 opacity-5 bg-gradient-to-br', themeConfig.gradient)} />
      <CardHeader>
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Inspiration Prompt
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-pretty min-h-[4rem]">{prompts[currentPrompt]}</p>
        <Button
          onClick={generatePrompt}
          disabled={isLoading}
          className={cn('w-full bg-gradient-to-r', themeConfig.gradient)}
        >
          {isLoading ? 'Generating...' : 'New Prompt'}
        </Button>
      </CardContent>
    </Card>
  );
}
