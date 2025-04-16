'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Settings, 
  Plus, 
  X, 
  GripVertical, 
  Save, 
  RotateCcw,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff
} from 'lucide-react';

// Import dashboard widgets
import { TodayEventCard } from '@/components/dashboard/today-event-card';
import { ValueCard } from '@/components/dashboard/value-card';
// TODO: LeaderboardSection component is missing. Import and usage commented out for now.
// import { LeaderboardSection } from '@/app/dashboard/components/leaderboard-section';
import { FeaturePreview } from '@/components/dashboard/feature-preview';
import { JourneyMap } from '@/components/dashboard/journey-map';
import { QuickStartGuide } from '@/components/onboarding/quick-start-guide';

// Define available widgets
type Widget = {
  id: string;
  category: string;
  title: string;
  description: string;
  component: React.ElementType;
  defaultSize: string;
  allowedSizes: string[];
  defaultEnabled: boolean;
  [key: string]: any;
};

const availableWidgets: { [key: string]: Widget } = {
  today_event: {
    id: 'today_event',
    title: 'Today\'s Event',
    description: 'View and participate in today\'s featured event',
    component: TodayEventCard,
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium', 'large'],
    defaultEnabled: true,
    category: 'events'
  },
  journey_map: {
    id: 'journey_map',
    title: 'Journey Map',
    description: 'Track your progress through the Avolve experience',
    component: JourneyMap,
    defaultSize: 'large',
    allowedSizes: ['medium', 'large', 'full'],
    defaultEnabled: true,
    category: 'progress'
  },
  quick_start: {
    id: 'quick_start',
    title: 'Quick Start Guide',
    description: 'Follow these steps to get the most out of your Avolve experience',
    component: QuickStartGuide,
    defaultSize: 'medium',
    allowedSizes: ['medium', 'large'],
    defaultEnabled: true,
    category: 'onboarding'
  },
  // TODO: LeaderboardSection component is missing. Usage commented out for now.
  // leaderboard: {
  //   id: 'leaderboard',
  //   title: 'Leaderboard',
  //   description: 'See how you rank among other members',
  //   component: LeaderboardSection,
  //   defaultSize: 'medium',
  //   allowedSizes: ['small', 'medium', 'large'],
  //   defaultEnabled: true,
  //   category: 'community'
  // },
  value_card: {
    id: 'value_card',
    title: 'Value Card',
    description: 'Track your progress in different value pillars',
    component: ValueCard,
    defaultSize: 'small',
    allowedSizes: ['small', 'medium'],
    defaultEnabled: true,
    category: 'progress'
  },
  upcoming_features: {
    id: 'upcoming_features',
    title: 'Upcoming Features',
    description: 'Preview features you can unlock',
    component: FeaturePreview,
    defaultSize: 'large',
    allowedSizes: ['medium', 'large', 'full'],
    defaultEnabled: true,
    category: 'features'
  }
};

// Define widget categories
const widgetCategories = {
  progress: 'Progress Tracking',
  events: 'Events & Activities',
  community: 'Community',
  features: 'Platform Features',
  onboarding: 'Onboarding'
};

// Define widget sizes
const widgetSizes = {
  small: 'Small (1x1)',
  medium: 'Medium (2x1)',
  large: 'Large (2x2)',
  full: 'Full Width (3x1)'
};

interface CustomizableDashboardProps {
  userId: string;
}

export function CustomizableDashboard({ userId }: CustomizableDashboardProps) {
  const [activeWidgets, setActiveWidgets] = useState<Widget[]>([]);
  const [availableWidgetsState, setAvailableWidgetsState] = useState<{ [key: string]: Widget }>(availableWidgets);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [focusedWidget, setFocusedWidget] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dashboardMode, setDashboardMode] = useState<'grid' | 'focus'>('grid');
  const supabase = createClientComponentClient();

  // Fetch user's dashboard configuration
  useEffect(() => {
    async function fetchDashboardConfig() {
      const { data, error } = await supabase
        .from('user_dashboard_config')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        // If user has a saved configuration, use it
        setActiveWidgets(data.widgets || []);
      } else {
        // Otherwise use default configuration
        const defaultWidgets = Object.values(availableWidgets)
          .filter((widget: Widget) => widget.defaultEnabled)
          .map((widget: Widget) => ({
            id: widget.id,
            size: widget.defaultSize,
            visible: true
          }));
        
        setActiveWidgets(defaultWidgets);
      }
    }

    fetchDashboardConfig();
  }, [userId, supabase]);

  // Save dashboard configuration
  const saveDashboardConfig = async () => {
    await supabase
      .from('user_dashboard_config')
      .upsert({
        user_id: userId,
        widgets: activeWidgets,
        updated_at: new Date().toISOString()
      });

    setIsCustomizing(false);
  };

  // Reset dashboard to defaults
  const resetDashboard = () => {
    const defaultWidgets = Object.values(availableWidgets)
      .filter((widget: Widget) => widget.defaultEnabled)
      .map((widget: Widget) => ({
        id: widget.id,
        size: widget.defaultSize,
        visible: true
      }));
    
    setActiveWidgets(defaultWidgets);
  };

  // Handle drag end for reordering widgets
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(activeWidgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setActiveWidgets(items);
  };

  // Add a widget to the dashboard
  const addWidget = (widgetId: string) => {
    const widgetToAdd = availableWidgetsState[widgetId];
    
    if (widgetToAdd) {
      setActiveWidgets([
        ...activeWidgets,
        {
          id: widgetId,
          size: widgetToAdd.defaultSize,
          visible: true
        }
      ]);
    }
  };

  // Remove a widget from the dashboard
  const removeWidget = (index: number) => {
    const updatedWidgets = [...activeWidgets];
    updatedWidgets.splice(index, 1);
    setActiveWidgets(updatedWidgets);
  };

  // Toggle widget visibility
  const toggleWidgetVisibility = (index: number) => {
    const updatedWidgets = [...activeWidgets];
    updatedWidgets[index].visible = !updatedWidgets[index].visible;
    setActiveWidgets(updatedWidgets);
  };

  // Change widget size
  const changeWidgetSize = (index: number, size: string) => {
    const updatedWidgets = [...activeWidgets];
    updatedWidgets[index].size = size;
    setActiveWidgets(updatedWidgets);
  };

  // Get size class for a widget
  const getWidgetSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1';
      case 'medium':
        return 'col-span-2 row-span-1';
      case 'large':
        return 'col-span-2 row-span-2';
      case 'full':
        return 'col-span-3 row-span-1';
      default:
        return 'col-span-1 row-span-1';
    }
  };

  // Focus on a specific widget
  const focusWidget = (widgetId: string) => {
    setFocusedWidget(widgetId);
    setDashboardMode('focus');
  };

  // Exit focus mode
  const exitFocusMode = () => {
    setFocusedWidget(null);
    setDashboardMode('grid');
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <div className="flex items-center space-x-2">
          {dashboardMode === 'focus' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exitFocusMode}
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              Exit Focus Mode
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsCustomizing(!isCustomizing)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isCustomizing ? 'Done' : 'Customize'}
          </Button>
        </div>
      </div>

      {isCustomizing ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customize Your Dashboard</CardTitle>
              <CardDescription>
                Drag and drop widgets to reorder, toggle visibility, or change size
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="widgets">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {activeWidgets.map((widget: Widget, index: number) => (
                        <Draggable 
                          key={`${widget.id}-${index}`} 
                          draggableId={`${widget.id}-${index}`} 
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center p-3 border border-zinc-800 rounded-md bg-zinc-950"
                            >
                              <div {...provided.dragHandleProps} className="mr-3">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="font-medium">
                                  {availableWidgetsState[widget.id]?.title || widget.id}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {availableWidgetsState[widget.id]?.description || ''}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-2 ml-4">
                                <select
                                  value={widget.size}
                                  onChange={(e) => changeWidgetSize(index, e.target.value)}
                                  className="bg-zinc-900 border border-zinc-800 rounded-md text-sm py-1 px-2"
                                >
                                  {availableWidgetsState[widget.id]?.allowedSizes.map((size: string) => (
                                    <option key={size} value={size}>
                                      {widgetSizes[size as keyof typeof widgetSizes]}
                                    </option>
                                  ))}
                                </select>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleWidgetVisibility(index)}
                                  title={widget.visible ? 'Hide widget' : 'Show widget'}
                                >
                                  {widget.visible ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeWidget(index)}
                                  title="Remove widget"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widget
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Widgets</DialogTitle>
                    <DialogDescription>
                      Choose widgets to add to your dashboard
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      {Object.entries(widgetCategories).map(([key, label]) => (
                        <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {['all', ...Object.keys(widgetCategories)].map((category) => (
                      <TabsContent key={category} value={category} className="space-y-2">
                        {Object.values(availableWidgetsState)
                          .filter((widget: Widget) => category === 'all' || widget.category === category)
                          .map((widget: Widget) => {
                            const isAdded = activeWidgets.some((w: Widget) => w.id === widget.id);
                            
                            return (
                              <div 
                                key={widget.id}
                                className="flex items-center justify-between p-3 border border-zinc-800 rounded-md"
                              >
                                <div>
                                  <h3 className="font-medium">{widget.title}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {widget.description}
                                  </p>
                                </div>
                                <Button
                                  variant={isAdded ? "secondary" : "default"}
                                  size="sm"
                                  onClick={() => addWidget(widget.id)}
                                  disabled={isAdded}
                                >
                                  {isAdded ? 'Added' : 'Add'}
                                </Button>
                              </div>
                            );
                          })}
                      </TabsContent>
                    ))}
                  </Tabs>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                      Done
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-zinc-800 pt-4">
              <Button variant="outline" onClick={resetDashboard}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button onClick={saveDashboardConfig}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : dashboardMode === 'focus' ? (
        // Focus mode - show only the selected widget
        <div className="w-full">
          {focusedWidget && activeWidgets.find((w: Widget) => w.id === focusedWidget) && (
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {availableWidgetsState[focusedWidget]?.title || focusedWidget}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={exitFocusMode}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {React.createElement(
                  availableWidgetsState[focusedWidget]?.component,
                  { userId }
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Grid mode - show all visible widgets
        <div className="grid grid-cols-3 gap-4">
          {activeWidgets
            .filter((widget: Widget) => widget.visible)
            .map((widget: Widget, index: number) => (
              <Card 
                key={`${widget.id}-${index}`}
                className={`${getWidgetSizeClass(widget.size)} overflow-hidden`}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    {availableWidgetsState[widget.id]?.title || widget.id}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => focusWidget(widget.id)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {availableWidgetsState[widget.id]?.component && 
                    React.createElement(
                      availableWidgetsState[widget.id].component,
                      { userId }
                    )
                  }
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
