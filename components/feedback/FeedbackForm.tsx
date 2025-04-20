// components/feedback/FeedbackForm.tsx
'use client'

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const FeedbackForm: React.FC = () => {
  const [rating, setRating] = useState('3');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input type="radio" id="rating-1" name="rating" value="1" checked={rating === '1'} onChange={() => setRating('1')} />
                <Label htmlFor="rating-1">1 (Poor)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="rating-2" name="rating" value="2" checked={rating === '2'} onChange={() => setRating('2')} />
                <Label htmlFor="rating-2">2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="rating-3" name="rating" value="3" checked={rating === '3'} onChange={() => setRating('3')} />
                <Label htmlFor="rating-3">3 (Average)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="rating-4" name="rating" value="4" checked={rating === '4'} onChange={() => setRating('4')} />
                <Label htmlFor="rating-4">4</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="rating-5" name="rating" value="5" checked={rating === '5'} onChange={() => setRating('5')} />
                <Label htmlFor="rating-5">5 (Excellent)</Label>
              </div>
            </div>
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
