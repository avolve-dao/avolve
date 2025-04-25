'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Loader2, RefreshCw, Plus, Save, Trash2, Users, Percent, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FeatureFlag {
  id: string;
  key: string;
  description: string;
  value: Record<string, any>;
  enabled: boolean;
  percentage_rollout: number | null;
  user_ids: string[] | null;
  user_roles: string[] | null;
  token_requirements: Record<string, number> | null;
  created_at: string;
  updated_at: string;
}

interface TokenType {
  id: string;
  name: string;
  symbol: string;
  description: string;
}

export default function FeatureFlagsAdminPage() {
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [tokenTypes, setTokenTypes] = useState<TokenType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingFeature, setEditingFeature] = useState<FeatureFlag | null>(null);
  const [newFeature, setNewFeature] = useState({
    key: '',
    description: '',
    enabled: true,
    percentage_rollout: 100,
    token_requirements: {} as Record<string, number>,
  });
  const [showNewFeatureDialog, setShowNewFeatureDialog] = useState(false);

  // Fetch feature flags and token types
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch feature flags
      const { data: flagsData, error: flagsError } = await supabase
        .from('feature_flags')
        .select('*')
        .order('key');

      if (flagsError) throw flagsError;

      // Fetch token types
      const { data: tokensData, error: tokensError } = await supabase
        .from('token_types')
        .select('*')
        .order('name');

      if (tokensError) throw tokensError;

      setFeatureFlags(flagsData as FeatureFlag[]);
      setTokenTypes(tokensData as TokenType[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feature flags',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update feature flag
  const updateFeatureFlag = async (id: string, updates: Partial<FeatureFlag>) => {
    setSaving(id);
    try {
      const { error } = await supabase.from('feature_flags').update(updates).eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feature flag updated successfully',
      });

      // Update local state
      setFeatureFlags(prev => prev.map(flag => (flag.id === id ? { ...flag, ...updates } : flag)));
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast({
        title: 'Error',
        description: 'Failed to update feature flag',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  // Create new feature flag
  const createFeatureFlag = async () => {
    if (!newFeature.key.trim()) {
      toast({
        title: 'Error',
        description: 'Feature key is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving('new');
    try {
      // Prepare token requirements
      const tokenRequirements: Record<string, number> = {};
      Object.entries(newFeature.token_requirements).forEach(([key, value]) => {
        if (value > 0) {
          tokenRequirements[key] = value;
        }
      });

      const { data, error } = await supabase
        .from('feature_flags')
        .insert({
          key: newFeature.key,
          description: newFeature.description,
          enabled: newFeature.enabled,
          percentage_rollout: newFeature.percentage_rollout,
          token_requirements: tokenRequirements,
          value: { enabled: newFeature.enabled },
        })
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feature flag created successfully',
      });

      // Update local state
      if (data) {
        setFeatureFlags(prev => [...prev, data[0] as FeatureFlag]);
      }

      // Reset form and close dialog
      setNewFeature({
        key: '',
        description: '',
        enabled: true,
        percentage_rollout: 100,
        token_requirements: {},
      });
      setShowNewFeatureDialog(false);
    } catch (error) {
      console.error('Error creating feature flag:', error);
      toast({
        title: 'Error',
        description: 'Failed to create feature flag',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  // Delete feature flag
  const deleteFeatureFlag = async (id: string) => {
    if (
      !confirm('Are you sure you want to delete this feature flag? This action cannot be undone.')
    ) {
      return;
    }

    setSaving(id);
    try {
      const { error } = await supabase.from('feature_flags').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feature flag deleted successfully',
      });

      // Update local state
      setFeatureFlags(prev => prev.filter(flag => flag.id !== id));
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete feature flag',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  // Handle token requirement change
  const handleTokenRequirementChange = (
    feature: FeatureFlag,
    tokenSymbol: string,
    value: number
  ) => {
    const updatedRequirements = {
      ...(feature.token_requirements || {}),
      [tokenSymbol]: value,
    };

    // Remove token if value is 0
    if (value === 0) {
      delete updatedRequirements[tokenSymbol];
    }

    updateFeatureFlag(feature.id, { token_requirements: updatedRequirements });
  };

  // Handle new feature token requirement change
  const handleNewFeatureTokenChange = (tokenSymbol: string, value: number) => {
    setNewFeature(prev => ({
      ...prev,
      token_requirements: {
        ...prev.token_requirements,
        [tokenSymbol]: value,
      },
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Feature Flags</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Dialog open={showNewFeatureDialog} onOpenChange={setShowNewFeatureDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Feature Flag
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Feature Flag</DialogTitle>
                <DialogDescription>
                  Add a new feature flag to control feature visibility and rollout.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="key" className="text-right">
                    Key
                  </Label>
                  <Input
                    id="key"
                    value={newFeature.key}
                    onChange={e => setNewFeature({ ...newFeature, key: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g., new_feature"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newFeature.description}
                    onChange={e => setNewFeature({ ...newFeature, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Describe what this feature does"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="enabled" className="text-right">
                    Enabled
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      id="enabled"
                      checked={newFeature.enabled}
                      onCheckedChange={checked =>
                        setNewFeature({ ...newFeature, enabled: checked })
                      }
                    />
                    <Label htmlFor="enabled" className="cursor-pointer">
                      {newFeature.enabled ? 'Enabled' : 'Disabled'}
                    </Label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rollout" className="text-right">
                    Rollout %
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Slider
                      id="rollout"
                      defaultValue={[newFeature.percentage_rollout]}
                      max={100}
                      step={1}
                      onValueChange={value =>
                        setNewFeature({ ...newFeature, percentage_rollout: value[0] })
                      }
                    />
                    <div className="text-right text-sm text-muted-foreground">
                      {newFeature.percentage_rollout}%
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Token Requirements</Label>
                  <div className="col-span-3 space-y-2">
                    {tokenTypes.map(token => (
                      <div key={token.id} className="flex items-center gap-2">
                        <Label htmlFor={`token-${token.symbol}`} className="w-16">
                          {token.symbol}
                        </Label>
                        <Input
                          id={`token-${token.symbol}`}
                          type="number"
                          min="0"
                          value={newFeature.token_requirements[token.symbol] || 0}
                          onChange={e =>
                            handleNewFeatureTokenChange(token.symbol, parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Set the token requirements to unlock this feature. Leave as 0 for no
                      requirement.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewFeatureDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createFeatureFlag} disabled={saving === 'new'}>
                  {saving === 'new' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Feature Flag'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : featureFlags.length > 0 ? (
        <div className="space-y-4">
          <Accordion type="multiple" className="w-full">
            {featureFlags.map(feature => (
              <AccordionItem key={feature.id} value={feature.id}>
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{feature.key}</span>
                      {feature.enabled ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 hover:bg-green-50"
                        >
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                          Disabled
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {feature.percentage_rollout !== null && feature.percentage_rollout < 100 && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                        >
                          <Percent className="h-3 w-3 mr-1" />
                          {feature.percentage_rollout}%
                        </Badge>
                      )}
                      {feature.token_requirements &&
                        Object.keys(feature.token_requirements).length > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 hover:bg-amber-50"
                          >
                            <Coins className="h-3 w-3 mr-1" />
                            {Object.keys(feature.token_requirements).length} token
                            {Object.keys(feature.token_requirements).length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      {feature.user_roles && feature.user_roles.length > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 hover:bg-purple-50"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {feature.user_roles.length} role
                          {feature.user_roles.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`description-${feature.id}`}>Description</Label>
                        <Input
                          id={`description-${feature.id}`}
                          value={feature.description}
                          onChange={e =>
                            updateFeatureFlag(feature.id, { description: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`enabled-${feature.id}`}>Status</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Switch
                            id={`enabled-${feature.id}`}
                            checked={feature.enabled}
                            onCheckedChange={checked =>
                              updateFeatureFlag(feature.id, {
                                enabled: checked,
                                value: { ...feature.value, enabled: checked },
                              })
                            }
                          />
                          <Label htmlFor={`enabled-${feature.id}`} className="cursor-pointer">
                            {feature.enabled ? 'Enabled' : 'Disabled'}
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`rollout-${feature.id}`}>Percentage Rollout</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Slider
                            id={`rollout-${feature.id}`}
                            defaultValue={[feature.percentage_rollout || 100]}
                            max={100}
                            step={1}
                            onValueChange={value =>
                              updateFeatureFlag(feature.id, { percentage_rollout: value[0] })
                            }
                          />
                        </div>
                        <div className="w-12 text-center">{feature.percentage_rollout || 100}%</div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Percentage of users who will see this feature. Set to 100% to show to
                        everyone.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Token Requirements</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {tokenTypes.map(token => (
                          <div key={token.id} className="flex items-center gap-2">
                            <Label htmlFor={`token-${feature.id}-${token.symbol}`} className="w-16">
                              {token.symbol}
                            </Label>
                            <Input
                              id={`token-${feature.id}-${token.symbol}`}
                              type="number"
                              min="0"
                              value={
                                (feature.token_requirements &&
                                  feature.token_requirements[token.symbol]) ||
                                0
                              }
                              onChange={e =>
                                handleTokenRequirementChange(
                                  feature,
                                  token.symbol,
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Set the token requirements to unlock this feature. Set to 0 for no
                        requirement.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteFeatureFlag(feature.id)}
                        disabled={saving === feature.id}
                      >
                        {saving === feature.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="ml-2">Delete</span>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No feature flags found</p>
            <Button onClick={() => setShowNewFeatureDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first feature flag
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
