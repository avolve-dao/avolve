import React, { useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { useForm } from 'react-hook-form';
import type { ControllerRenderProps } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface CanvasEntryInput {
  pillar: 'individual' | 'collective' | 'ecosystem';
  canvas_type: string;
  title: string;
  description?: string;
}

const CanvasEditor: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formMethods = useForm<CanvasEntryInput>({
    defaultValues: {
      pillar: 'individual',
      canvas_type: 'hypothesis',
      title: '',
      description: '',
    },
  });

  const { handleSubmit, reset, control } = formMethods;

  const onSubmit = async (values: CanvasEntryInput) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await createClient().from('canvas_entries').insert([values]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      reset();
      if (onCreated) onCreated();
    }
    setLoading(false);
  };

  const canvasTypes = [
    'hypothesis',
    'pain',
    'gain',
    'job_to_be_done',
    'goal',
  ];

  const pillars = [
    { key: 'individual', label: 'Individual (Superachiever)' },
    { key: 'collective', label: 'Collective (Superachievers)' },
    { key: 'ecosystem', label: 'Ecosystem (Supercivilization)' },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create New Canvas Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="pillar"
              render={({ field }: { field: ControllerRenderProps<CanvasEntryInput, 'pillar'> }) => (
                <FormItem>
                  <FormLabel>Pillar</FormLabel>
                  <Select value={field.value} onValueChange={(val: 'individual' | 'collective' | 'ecosystem') => field.onChange(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pillars.map(p => (
                        <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="canvas_type"
              render={({ field }: { field: ControllerRenderProps<CanvasEntryInput, 'canvas_type'> }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={(val: string) => field.onChange(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {canvasTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="title"
              render={({ field }: { field: ControllerRenderProps<CanvasEntryInput, 'title'> }) => (
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
              name="description"
              render={({ field }: { field: ControllerRenderProps<CanvasEntryInput, 'description'> }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 items-center">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Canvas Entry'}
              </Button>
              {error && <span className="text-destructive text-sm">{error}</span>}
              {success && <span className="text-green-600 text-sm">Canvas entry created!</span>}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CanvasEditor;
