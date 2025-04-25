'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useTracking } from '@/utils/tracking';
import { createClient } from '@/lib/supabase/client';
import { Star } from 'lucide-react';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Define the form schema with zod
const feedbackFormSchema = z.object({
  category: z.string({
    required_error: 'Please select a category for your feedback.',
  }),
  rating: z
    .number({
      required_error: 'Please provide a rating.',
    })
    .min(1)
    .max(5),
  comment: z
    .string()
    .min(5, {
      message: 'Comment must be at least 5 characters.',
    })
    .max(500, {
      message: 'Comment cannot be more than 500 characters.',
    }),
  worthTime: z.boolean(),
});

// Infer the type from the schema
type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

// Define the feedback categories
const feedbackCategories = [
  { value: 'ui', label: 'User Interface' },
  { value: 'features', label: 'Platform Features' },
  { value: 'content', label: 'Content Quality' },
  { value: 'performance', label: 'Platform Performance' },
  { value: 'tokenomics', label: 'Token System' },
  { value: 'community', label: 'Community Experience' },
  { value: 'other', label: 'Other' },
];

// Star Rating Component
interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

function StarRating({ value, onChange, max = 5, size = 'md' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  // Size mappings
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  // Handle mouse enter on a star
  const handleMouseEnter = (starValue: number) => {
    setHoverValue(starValue);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  // Handle click on a star
  const handleClick = (starValue: number) => {
    onChange(starValue);
  };

  // Determine if a star should be filled
  const isFilled = (starValue: number) => {
    if (hoverValue !== null) {
      return starValue <= hoverValue;
    }
    return starValue <= value;
  };

  return (
    <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
      {Array.from({ length: max }, (_, i) => i + 1).map(starValue => (
        <Star
          key={starValue}
          className={cn(
            sizeClasses[size],
            'cursor-pointer transition-all duration-150',
            isFilled(starValue) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
          )}
          onMouseEnter={() => handleMouseEnter(starValue)}
          onClick={() => handleClick(starValue)}
        />
      ))}
    </div>
  );
}

interface FeedbackFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ userId, onSuccess }: FeedbackFormProps) {
  const { toast } = useToast();
  const tracking = useTracking(userId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with default values
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      category: '',
      rating: 0,
      comment: '',
      worthTime: true,
    },
  });

  // Handle form submission
  async function onSubmit(data: FeedbackFormValues) {
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Submit feedback to the database
      const { error } = await supabase.from('user_feedback').insert({
        user_id: userId,
        category: data.category,
        rating: data.rating,
        comment: data.comment,
        worth_time: data.worthTime,
      });

      if (error) {
        throw error;
      }

      // Track the feedback submission
      await tracking.trackAction('comment', {
        details: {
          category: data.category,
          rating: data.rating,
          worth_time: data.worthTime,
        },
      });

      // Show success toast
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback! We value your input.',
        variant: 'default',
      });

      // Reset the form
      form.reset();

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-6 border-zinc-800 bg-zinc-950/50">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Share Your Feedback</h3>
        <p className="text-sm text-muted-foreground">
          Help us improve the Avolve platform with your valuable insights
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {feedbackCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Choose the area your feedback relates to</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <StarRating value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormDescription>Rate your experience from 1 to 5 stars</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="worthTime"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-800 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Worth Your Time?</FormLabel>
                  <FormDescription>Was this interaction worth your time?</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share your thoughts, suggestions, or experiences..."
                    className="resize-none min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Your detailed feedback helps us improve</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
