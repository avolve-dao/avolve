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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { toast } from '@/components/ui/use-toast';
import { CalendarIcon, MapPin, Users, Video } from 'lucide-react';
import { format } from 'date-fns';

interface CreateEventFormProps {
  onSuccess?: () => void;
}

export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
    location: '',
    isVirtual: false,
    meetingUrl: '',
    coverImageUrl: '',
    maxParticipants: '',
    isPublished: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (name: string) => (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: date }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.startTime || !formData.endTime) {
      toast({
        title: 'Missing information',
        description: 'Please fill out all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast({
        title: 'Invalid time range',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to create events',
          variant: 'destructive',
        });
        return;
      }

      // Insert the event into the database
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          organizer_id: user.id,
          start_time: formData.startTime.toISOString(),
          end_time: formData.endTime.toISOString(),
          location: formData.location,
          is_virtual: formData.isVirtual,
          meeting_url: formData.isVirtual ? formData.meetingUrl : null,
          cover_image_url: formData.coverImageUrl || null,
          max_participants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          is_published: formData.isPublished,
        })
        .select();

      if (error) throw error;

      toast({
        title: 'Event created!',
        description: 'Your event has been successfully created.',
      });

      // Reset form or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/personal/events');
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'There was a problem creating your event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Event</CardTitle>
        <CardDescription>
          Host an event for the Superachiever community to connect and grow together.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title*</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter a descriptive title for your event"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description*</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what your event is about, who should attend, and what participants can expect"
              value={formData.description}
              onChange={handleChange}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time*</Label>
              <DateTimePicker date={formData.startTime} setDate={handleDateChange('startTime')} />
            </div>
            <div className="space-y-2">
              <Label>End Time*</Label>
              <DateTimePicker date={formData.endTime} setDate={handleDateChange('endTime')} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isVirtual"
              checked={formData.isVirtual}
              onCheckedChange={handleSwitchChange('isVirtual')}
            />
            <Label htmlFor="isVirtual">This is a virtual event</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{formData.isVirtual ? 'Event Platform' : 'Location'}</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-muted-foreground">
                {formData.isVirtual ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </span>
              <Input
                id="location"
                name="location"
                placeholder={
                  formData.isVirtual
                    ? 'e.g. Zoom, Google Meet, etc.'
                    : 'e.g. Community Center, 123 Main St'
                }
                value={formData.location}
                onChange={handleChange}
                className="pl-8"
              />
            </div>
          </div>

          {formData.isVirtual && (
            <div className="space-y-2">
              <Label htmlFor="meetingUrl">Meeting URL</Label>
              <Input
                id="meetingUrl"
                name="meetingUrl"
                placeholder="https://..."
                value={formData.meetingUrl}
                onChange={handleChange}
                type="url"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Cover Image URL (optional)</Label>
            <Input
              id="coverImageUrl"
              name="coverImageUrl"
              placeholder="https://example.com/image.jpg"
              value={formData.coverImageUrl}
              onChange={handleChange}
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Maximum Participants (optional)
            </Label>
            <Input
              id="maxParticipants"
              name="maxParticipants"
              placeholder="Leave blank for unlimited"
              value={formData.maxParticipants}
              onChange={handleChange}
              type="number"
              min="1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublished"
              checked={formData.isPublished}
              onCheckedChange={handleSwitchChange('isPublished')}
            />
            <Label htmlFor="isPublished">Publish event immediately</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
