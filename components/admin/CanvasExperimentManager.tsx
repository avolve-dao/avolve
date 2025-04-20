import React, { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface CanvasEntry {
  id: string;
  title: string;
}

interface ExperimentInput {
  canvas_entry_id: string;
  title: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  experiment_type: 'real' | 'simulation';
}

interface CanvasExperimentManagerProps {
  onCreated?: () => void;
}

const CanvasExperimentManager: React.FC<CanvasExperimentManagerProps> = ({ onCreated }) => {
  const [canvasEntries, setCanvasEntries] = useState<CanvasEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formMethods = useForm<ExperimentInput>({
    defaultValues: {
      canvas_entry_id: '',
      title: '',
      description: '',
      status: 'proposed',
      start_date: '',
      end_date: '',
      experiment_type: 'real',
    },
  });

  const { handleSubmit, reset, control } = formMethods;

  useEffect(() => {
    const fetchCanvasEntries = async () => {
      const { data, error } = await createClient()
        .from('canvas_entries')
        .select('id, title')
        .order('created_at', { ascending: false });
      if (!error && data) setCanvasEntries(data);
    };
    fetchCanvasEntries();
  }, [setCanvasEntries]);

  const onSubmit = async (values: ExperimentInput) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (!values.canvas_entry_id) {
      setError('Please select a Canvas Entry.');
      setLoading(false);
      return;
    }
    const { error } = await createClient().from('experiments').insert([values]);
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create New Experiment</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="canvas_entry_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canvas Entry</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val: string) => field.onChange(val)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Canvas Entry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Select Canvas Entry --</SelectItem>
                      {canvasEntries.map(entry => (
                        <SelectItem key={entry.id} value={entry.id}>{entry.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={(val: string) => field.onChange(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proposed">Proposed</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="experiment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experiment Type</FormLabel>
                  <Select value={field.value} onValueChange={(val: string) => field.onChange(val)} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real">Real-World</SelectItem>
                      <SelectItem value="simulation">Simulation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 items-center">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Experiment'}
              </Button>
              {error && <span className="text-destructive text-sm">{error}</span>}
              {success && <span className="text-green-600 text-sm">Experiment created!</span>}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CanvasExperimentManager;
