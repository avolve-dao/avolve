"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { InvitationService } from '@/lib/invitation/invitation-service';
import { InvitationTier, InvitationTierAvailability } from '@/lib/invitation/invitation-types';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// Form schema using zod for validation
const invitationFormSchema = z.object({
  tier_name: z.string({
    required_error: "Please select an invitation tier",
  }),
  email: z.string().email("Invalid email address").optional(),
});

type InvitationFormValues = z.infer<typeof invitationFormSchema>;

// Sacred geometry inspired styles
const sacredGeometryClasses = {
  container: "rounded-lg border border-slate-200 p-6 shadow-sm bg-white",
  header: "text-2xl font-bold mb-6 text-center",
  form: "space-y-6",
  label: "block text-sm font-medium text-gray-700 mb-1",
  input: "w-full rounded-md border border-slate-300 p-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
  select: "w-full rounded-md border border-slate-300 p-2.5 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
  button: "w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2",
  errorText: "text-sm text-red-500 mt-1",
  tierCard: "border rounded-lg p-4 cursor-pointer transition-all duration-300",
  tierCardSelected: "border-2 border-indigo-500 bg-indigo-50 shadow-md",
  tierCardTitle: "font-semibold text-lg mb-1",
  tierCardDescription: "text-sm text-gray-500 mb-2",
  tierCardDetails: "text-xs text-gray-600",
  tierUnavailable: "opacity-60 cursor-not-allowed",
  tierBadge: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
  tierAvailableBadge: "bg-green-100 text-green-800",
  tierUnavailableBadge: "bg-red-100 text-red-800",
  tierLimitBadge: "bg-amber-100 text-amber-800",
  tierCostBadge: "bg-blue-100 text-blue-800",
  refreshButton: "text-indigo-600 hover:text-indigo-800 text-sm flex items-center mt-2",
  tooltipContainer: "relative group",
  tooltip: "absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-max z-10",
};

// Get token color based on symbol
const getTokenColor = (tokenType: string): string => {
  switch (tokenType) {
    case 'SPD': return 'bg-gradient-to-r from-red-500 to-blue-500'; // Red-Green-Blue
    case 'SHE': return 'bg-gradient-to-r from-rose-500 to-orange-500'; // Rose-Red-Orange
    case 'PSP': return 'bg-gradient-to-r from-amber-500 to-yellow-500'; // Amber-Yellow
    case 'SSA': return 'bg-gradient-to-r from-lime-500 to-emerald-500'; // Lime-Green-Emerald
    case 'BSP': return 'bg-gradient-to-r from-teal-500 to-cyan-500'; // Teal-Cyan
    case 'SGB': return 'bg-gradient-to-r from-sky-500 to-indigo-500'; // Sky-Blue-Indigo
    case 'SMS': return 'bg-gradient-to-r from-violet-500 to-fuchsia-500'; // Violet-Purple-Fuchsia-Pink
    case 'SAP': return 'bg-gradient-to-r from-slate-500 to-slate-700'; // Stone gradient
    case 'SCQ': return 'bg-gradient-to-r from-slate-400 to-slate-600'; // Slate gradient
    case 'GEN': return 'bg-gradient-to-r from-zinc-400 to-zinc-600'; // Zinc gradient
    default: return 'bg-gray-500';
  }
};

/**
 * InvitationForm Component
 * 
 * A form for creating new invitations with tier selection
 */
const InvitationForm: React.FC = () => {
  const { supabase } = useSupabase();
  const router = useRouter();
  const { toast } = useToast();
  const [tiers, setTiers] = useState<InvitationTierAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [refreshingTiers, setRefreshingTiers] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationFormSchema),
  });

  // Fetch invitation tiers on component mount
  useEffect(() => {
    fetchTiers();
  }, [supabase]);

  // Fetch available invitation tiers with availability information
  const fetchTiers = async () => {
    try {
      setRefreshingTiers(true);
      const invitationService = new InvitationService(supabase);
      
      // Use the new method to get tiers with availability information
      const { data, error } = await invitationService.getAvailableInvitationTiers(
        (await supabase.auth.getUser()).data.user?.id || ''
      );
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTiers(data);
        
        // Set default tier to the first available tier if any
        const availableTier = data.find(tier => tier.available);
        if (availableTier && !selectedTier) {
          setSelectedTier(availableTier.tier_name);
          setValue('tier_name', availableTier.tier_name);
        }
      }
    } catch (error: any) {
      console.error('Error fetching invitation tiers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invitation tiers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshingTiers(false);
    }
  };

  // Handle tier selection
  const handleTierSelect = (tierName: string) => {
    // Find the tier
    const tier = tiers.find(t => t.tier_name === tierName);
    
    // Only allow selection if tier is available
    if (tier && tier.available) {
      setSelectedTier(tierName);
      setValue('tier_name', tierName);
    } else {
      // Show toast explaining why tier can't be selected
      const reason = tier 
        ? (tier.remaining_invites <= 0 
            ? "You've reached your monthly limit for this tier" 
            : "You don't have enough tokens for this tier")
        : "This tier is not available";
        
      toast({
        title: "Cannot select tier",
        description: reason,
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const onSubmit = async (values: InvitationFormValues) => {
    try {
      setLoading(true);
      
      // Check if selected tier is available
      const selectedTierData = tiers.find(t => t.tier_name === values.tier_name);
      if (!selectedTierData || !selectedTierData.available) {
        throw new Error("Selected tier is not available. Please choose another tier.");
      }
      
      const invitationService = new InvitationService(supabase);
      const { data, error } = await invitationService.createInvitation(
        (await supabase.auth.getUser()).data.user?.id || '',
        {
          tier_name: values.tier_name,
          email: values.email
        }
      );
      
      if (error) {
        throw error;
      }
      
      if (data && data.success) {
        toast({
          title: "Success",
          description: data.message || "Invitation created successfully!",
        });
        
        // If code is available, show it in a separate toast for easy copying
        if (data.invitation_code) {
          toast({
            title: "Invitation Code",
            description: (
              <div className="flex flex-col">
                <span className="font-bold text-lg">{data.invitation_code}</span>
                <span className="text-xs mt-1">
                  Expires: {new Date(data.expires_at || '').toLocaleDateString()}
                </span>
              </div>
            ),
            duration: 10000, // Longer duration for copying
          });
        }
        
        // Refresh tiers to update availability
        fetchTiers();
        
        // Redirect to invitations dashboard
        router.push('/invitations/dashboard');
      } else {
        throw new Error(data?.message || 'Failed to create invitation');
      }
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create invitation. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get tier status badge
  const getTierStatusBadge = (tier: InvitationTierAvailability) => {
    if (tier.available) {
      return (
        <span className={`${sacredGeometryClasses.tierBadge} ${sacredGeometryClasses.tierAvailableBadge}`}>
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Available
        </span>
      );
    } else if (tier.remaining_invites <= 0) {
      return (
        <span className={`${sacredGeometryClasses.tierBadge} ${sacredGeometryClasses.tierLimitBadge}`}>
          <AlertCircle className="w-3 h-3 mr-1" />
          Limit Reached
        </span>
      );
    } else {
      return (
        <span className={`${sacredGeometryClasses.tierBadge} ${sacredGeometryClasses.tierUnavailableBadge}`}>
          <AlertCircle className="w-3 h-3 mr-1" />
          Insufficient Tokens
        </span>
      );
    }
  };

  return (
    <div className={sacredGeometryClasses.container}>
      <h2 className={sacredGeometryClasses.header}>Create New Invitation</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className={sacredGeometryClasses.form}>
        {/* Tier Selection */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={sacredGeometryClasses.label}>
              Select Invitation Tier
            </label>
            <button 
              type="button" 
              onClick={() => fetchTiers()}
              className={sacredGeometryClasses.refreshButton}
              disabled={refreshingTiers}
            >
              {refreshingTiers ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Tiers
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`${sacredGeometryClasses.tierCard} ${
                  selectedTier === tier.tier_name ? sacredGeometryClasses.tierCardSelected : ''
                } ${!tier.available ? sacredGeometryClasses.tierUnavailable : ''}`}
                onClick={() => handleTierSelect(tier.tier_name)}
              >
                <div className="flex items-center justify-between">
                  <h3 className={sacredGeometryClasses.tierCardTitle}>{tier.tier_name}</h3>
                  <div className={`w-6 h-6 rounded-full ${getTokenColor(tier.token_type)}`}></div>
                </div>
                
                <div className="mb-2">
                  {getTierStatusBadge(tier)}
                </div>
                
                <p className={sacredGeometryClasses.tierCardDescription}>
                  {tier.description || `Standard ${tier.tier_name} invitation`}
                </p>
                
                <div className={sacredGeometryClasses.tierCardDetails}>
                  <div className="flex justify-between">
                    <span>Token Cost:</span>
                    <div className={sacredGeometryClasses.tooltipContainer}>
                      <span className={`${sacredGeometryClasses.tierBadge} ${sacredGeometryClasses.tierCostBadge}`}>
                        {tier.token_cost} {tier.token_type}
                      </span>
                      {!tier.user_has_tokens && tier.token_cost > 0 && (
                        <span className={sacredGeometryClasses.tooltip}>
                          You need more {tier.token_type} tokens
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid for:</span>
                    <span>{tier.validity_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reward Multiplier:</span>
                    <span>x{tier.reward_multiplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Limit:</span>
                    <div className={sacredGeometryClasses.tooltipContainer}>
                      <span>{tier.remaining_invites} / {tier.max_invites}</span>
                      {tier.remaining_invites <= 0 && (
                        <span className={sacredGeometryClasses.tooltip}>
                          You've reached your monthly limit
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <input
            type="hidden"
            {...register('tier_name')}
          />
          
          {errors.tier_name && (
            <p className={sacredGeometryClasses.errorText}>{errors.tier_name.message}</p>
          )}
        </div>
        
        {/* Email Input (Optional) */}
        <div>
          <label htmlFor="email" className={sacredGeometryClasses.label}>
            Recipient Email (Optional)
          </label>
          <input
            id="email"
            type="email"
            className={sacredGeometryClasses.input}
            placeholder="friend@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className={sacredGeometryClasses.errorText}>{errors.email.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            If provided, we'll send the invitation directly to this email.
          </p>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedTier || !tiers.find(t => t.tier_name === selectedTier)?.available}
          className={`${sacredGeometryClasses.button} ${
            loading || !selectedTier || !tiers.find(t => t.tier_name === selectedTier)?.available
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Invitation'
          )}
        </button>
      </form>
    </div>
  );
};

export default InvitationForm;
