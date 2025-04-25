import React, { useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const supabase = createClient();

interface FeedbackWidgetProps {
  context: string; // e.g. 'canvas', 'experiment', 'onboarding', etc.
  userId: string;
}

interface FeedbackFormValues {
  feedback: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ context, userId }) => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FeedbackFormValues>({
    defaultValues: { feedback: '' },
  });

  const handleSubmit = async (values: FeedbackFormValues) => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase
      .from('user_feedback')
      .insert([{ user_id: userId, context, feedback: values.feedback }]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      form.reset();
    }
    setSubmitting(false);
  };

  return (
    <Card className="mt-4 max-w-md">
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
            <FormField
              name="feedback"
              render={({
                field,
              }: {
                field: ControllerRenderProps<FeedbackFormValues, 'feedback'>;
              }) => (
                <FormItem>
                  <FormLabel>Share your feedback:</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What did you think? Any ideas, pains, or gains?"
                      minLength={3}
                      required
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={submitting || !form.watch('feedback').trim()}
              className="w-full"
            >
              {submitting ? 'Submitting...' : 'Send Feedback'}
            </Button>
            {error && <div className="text-sm text-destructive mt-2">{error}</div>}
            {success && (
              <div className="text-sm text-green-600 mt-2">Thank you for your feedback!</div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FeedbackWidget;
