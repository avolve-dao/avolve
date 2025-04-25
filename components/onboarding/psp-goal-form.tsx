'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Heart, DollarSign, Users } from 'lucide-react';

interface PSPGoalFormProps {
  onComplete?: () => void;
}

export function PSPGoalForm({ onComplete }: PSPGoalFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    psp_area: 'health_energy',
    goal_description: '',
    current_state: '',
    desired_state: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAreaChange = (value: string) => {
    setFormData(prev => ({ ...prev, psp_area: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.goal_description || !formData.current_state || !formData.desired_state) {
      toast({
        title: 'Missing information',
        description: 'Please fill out all fields to create your goal.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert the goal into the database
      const { error } = await supabase.from('user_psp_goals').insert({
        psp_area: formData.psp_area,
        goal_description: formData.goal_description,
        current_state: formData.current_state,
        desired_state: formData.desired_state,
        is_active_mvp_goal: true,
      });

      if (error) throw error;

      // Mint initial SAP and PSP tokens for the user
      // This will be handled by a server action in a separate file

      toast({
        title: 'Goal created!',
        description:
          "Your Personal Success Puzzle goal has been created. You've earned your first tokens!",
      });

      // Redirect or call completion handler
      if (onComplete) {
        onComplete();
      } else {
        router.push('/personal/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: 'Error',
        description: 'There was a problem creating your goal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create Your Personal Success Goal</CardTitle>
        <CardDescription>
          Define one key goal for your Personal Success Puzzle. You'll be able to track progress and
          earn tokens for check-ins.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Choose an area to focus on</Label>
            <RadioGroup
              defaultValue="health_energy"
              value={formData.psp_area}
              onValueChange={handleAreaChange}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Label
                htmlFor="health_energy"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-muted ${formData.psp_area === 'health_energy' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'border-muted'}`}
              >
                <RadioGroupItem value="health_energy" id="health_energy" className="sr-only" />
                <Heart className="h-6 w-6 mb-2 text-amber-500" />
                <div className="text-center">
                  <h3 className="font-medium">Health & Energy</h3>
                  <p className="text-sm text-muted-foreground">Physical and mental wellbeing</p>
                </div>
              </Label>

              <Label
                htmlFor="wealth_career"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-muted ${formData.psp_area === 'wealth_career' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'border-muted'}`}
              >
                <RadioGroupItem value="wealth_career" id="wealth_career" className="sr-only" />
                <DollarSign className="h-6 w-6 mb-2 text-amber-500" />
                <div className="text-center">
                  <h3 className="font-medium">Wealth & Career</h3>
                  <p className="text-sm text-muted-foreground">Financial and professional growth</p>
                </div>
              </Label>

              <Label
                htmlFor="peace_people"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-muted ${formData.psp_area === 'peace_people' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'border-muted'}`}
              >
                <RadioGroupItem value="peace_people" id="peace_people" className="sr-only" />
                <Users className="h-6 w-6 mb-2 text-amber-500" />
                <div className="text-center">
                  <h3 className="font-medium">Peace & People</h3>
                  <p className="text-sm text-muted-foreground">Relationships and inner peace</p>
                </div>
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal_description">What's your goal?</Label>
            <Textarea
              id="goal_description"
              name="goal_description"
              placeholder="Describe your goal in this area..."
              value={formData.goal_description}
              onChange={handleChange}
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_state">Current State</Label>
              <Textarea
                id="current_state"
                name="current_state"
                placeholder="Where are you now regarding this goal?"
                value={formData.current_state}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desired_state">Desired State</Label>
              <Textarea
                id="desired_state"
                name="desired_state"
                placeholder="Where do you want to be?"
                value={formData.desired_state}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Goal & Earn Tokens'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
