// components/feedback/FeedbackForm.tsx
'use client'

import React, { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const FeedbackForm: React.FC = () => {
  const user = useUser();
  const [rating, setRating] = useState('3');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit feedback.',
        variant: 'destructive',
      });
      return;
    }

    if (!feedback.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide some feedback before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('user_feedback').insert([
        {
          user_id: user.id,
          rating: parseInt(rating),
          feedback_text: feedback,
          feedback_category: 'UI Experience',
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback! We appreciate your input.',
      });

      setFeedback('');
      setRating('3');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Share Your Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">How would you rate the new UI features?</Label>
            <RadioGroup id="rating" value={rating} onValueChange={setRating} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="rating-1" />
                <Label htmlFor="rating-1">1 (Poor)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="rating-2" />
                <Label htmlFor="rating-2">2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="rating-3" />
                <Label htmlFor="rating-3">3 (Average)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="rating-4" />
                <Label htmlFor="rating-4">4</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="rating-5" />
                <Label htmlFor="rating-5">5 (Excellent)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">What do you think about the dashboard and overall user experience?</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts on the new UI features, ease of navigation, or anything else..."
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
