"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useSupabase } from '@/components/providers/supabase-provider';
import { InvitationService } from '@/lib/invitation/invitation-service';

// Form schema using zod for validation
const invitationCodeSchema = z.object({
  code: z.string()
    .min(6, "Invitation code must be at least 6 characters")
    .max(12, "Invitation code must not exceed 12 characters")
    .regex(/^[A-Z0-9]+$/, "Invitation code must contain only uppercase letters and numbers"),
});

type InvitationCodeFormValues = z.infer<typeof invitationCodeSchema>;

interface InvitationCodeValidatorProps {
  onValidCode: (code: string) => void;
  onInvalidCode?: () => void;
}

/**
 * InvitationCodeValidator Component
 * 
 * Validates invitation codes during the signup process
 */
const InvitationCodeValidator: React.FC<InvitationCodeValidatorProps> = ({
  onValidCode,
  onInvalidCode,
}) => {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<InvitationCodeFormValues>({
    resolver: zodResolver(invitationCodeSchema),
    defaultValues: {
      code: '',
    },
  });

  const watchCode = watch('code');

  // Auto-format code to uppercase
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'code' && value.code) {
        // Convert to uppercase
        const formatted = value.code.toUpperCase();
        if (formatted !== value.code) {
          // This will update the input field
          document.getElementById('invitation-code')?.setAttribute('value', formatted);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Handle form submission
  const onSubmit = async (values: InvitationCodeFormValues) => {
    setLoading(true);
    setIsValid(null);
    
    try {
      const invitationService = new InvitationService(supabase);
      const { data, error } = await invitationService.isInvitationCodeValid(values.code);
      
      if (error) {
        throw error;
      }
      
      setIsValid(!!data);
      
      if (data) {
        toast({
          title: "Valid Invitation",
          description: "Your invitation code is valid. You can proceed with registration.",
          variant: "default",
        });
        onValidCode(values.code);
      } else {
        toast({
          title: "Invalid Invitation",
          description: "This invitation code is invalid or has expired.",
          variant: "destructive",
        });
        if (onInvalidCode) onInvalidCode();
      }
    } catch (error: any) {
      console.error('Error validating invitation code:', error);
      setIsValid(false);
      toast({
        title: "Error",
        description: error.message || "Failed to validate invitation code. Please try again.",
        variant: "destructive",
      });
      if (onInvalidCode) onInvalidCode();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Enter Invitation Code</h3>
        <p className="text-sm text-gray-500">
          You need a valid invitation code to join Avolve
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="invitation-code" className="block text-sm font-medium text-gray-700 mb-1">
            Invitation Code
          </label>
          <input
            id="invitation-code"
            type="text"
            className={`w-full rounded-md border ${
              isValid === true ? 'border-green-500' : 
              isValid === false ? 'border-red-500' : 'border-slate-300'
            } p-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
            placeholder="ENTER CODE"
            {...register('code')}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
            }}
          />
          {errors.code && (
            <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading || !watchCode || watchCode.length < 6}
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            loading || !watchCode || watchCode.length < 6
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Validating...' : 'Validate Code'}
        </button>
      </form>
      
      {isValid === true && (
        <div className="p-3 rounded bg-green-100 text-green-800 text-sm">
          ✓ Valid invitation code. You can proceed with registration.
        </div>
      )}
      
      {isValid === false && (
        <div className="p-3 rounded bg-red-100 text-red-800 text-sm">
          ✗ Invalid or expired invitation code. Please check and try again.
        </div>
      )}
    </div>
  );
};

export default InvitationCodeValidator;
