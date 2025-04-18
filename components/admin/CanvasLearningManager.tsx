import React, { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormDescription, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';

interface Experiment {
  id: string;
  title: string;
}

interface LearningInput {
  experiment_id: string;
  summary: string;
  details?: string;
}

const CanvasLearningManager: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formMethods = useForm<LearningInput>({
    defaultValues: {
      experiment_id: '',
      summary: '',
      details: '',
    },
  });

  const { handleSubmit, reset, setValue, watch } = formMethods;
  const form = watch();

  useEffect(() => {
    const fetchExperiments = async () => {
      const { data, error } = await createClient()
        .from('experiments')
        .select('id, title')
        .order('created_at', { ascending: false });
      if (!error && data) setExperiments(data);
    };
    fetchExperiments();
  }, []);

  const onSubmit = async (values: LearningInput) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (!values.experiment_id) {
      setError('Please select an Experiment.');
      setLoading(false);
      return;
    }
    const { error } = await createClient().from('learnings').insert([values]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      reset();
      if (onCreated) onCreated();
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Learning/Insight</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              control={formMethods.control}
              name="experiment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experiment</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={val => field.onChange(val)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Experiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Select Experiment --</SelectItem>
                      {experiments.map(exp => (
                        <SelectItem key={exp.id} value={exp.id}>{exp.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formMethods.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formMethods.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>Optional: Add more detail about the learning/insight.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 items-center">
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Learning'}
              </Button>
              {error && <span className="text-destructive text-sm">{error}</span>}
              {success && <span className="text-green-600 text-sm">Learning added!</span>}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CanvasLearningManager;
