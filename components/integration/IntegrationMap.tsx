import React, { useState, useEffect, useRef } from 'react';
import { useSupabase, hasUser } from '@/lib/supabase/use-supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/supabase';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

type IntegrationProfile = {
  id: string;
  user_id: string;
  personal_health_score: number;
  personal_wealth_score: number;
  personal_peace_score: number;
  business_users_score: number;
  business_admin_score: number;
  business_profit_score: number;
  supermind_vision_score: number;
  supermind_planning_score: number;
  supermind_execution_score: number;
  assessment_completed: boolean;
  primary_integration_need: string;
  integration_path: any;
};

type Domain = {
  id: string;
  name: string;
  subdomain: string;
  fullName: string;
  score: number;
  x: number;
  y: number;
  color: string;
  radius: number;
};

type Connection = {
  source: string;
  target: string;
  strength: number;
  opportunity: boolean;
};

export default function IntegrationMap() {
  const supabaseHook = useSupabase();
  const { supabase, user } = supabaseHook;
  const [profile, setProfile] = useState<IntegrationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [recommendedExercises, setRecommendedExercises] = useState<any[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!hasUser(supabaseHook)) return;

    async function fetchProfile() {
      try {
        setLoading(true);
        if (!hasUser(supabaseHook)) {
          setLoading(false);
          return;
        }
        // Fetch user's integration profile
        // At this point, hasUser(supabaseHook) guarantees user is not null
        const { data, error } = await supabase
          .from('integration_profiles')
          .select('*')
          .eq('user_id', supabaseHook.user!.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No profile found, user needs to take assessment
            setLoading(false);
            return;
          }
          throw error;
        }

        setProfile(data);

        // Defensive null checks for profile scores
        const safeScore = (score: number | undefined | null) =>
          typeof score === 'number' && !isNaN(score) ? score : 0;

        // Generate domain nodes
        const domainData: Domain[] = [
          // Personal domains
          {
            id: 'personal.health',
            name: 'Health',
            subdomain: 'health',
            fullName: 'Personal Health',
            score: safeScore(data.personal_health_score),
            x: 150,
            y: 100,
            color: 'rgb(245, 158, 11)', // amber-500
            radius: 30 + safeScore(data.personal_health_score) * 3,
          },
          {
            id: 'personal.wealth',
            name: 'Wealth',
            subdomain: 'wealth',
            fullName: 'Personal Wealth',
            score: safeScore(data.personal_wealth_score),
            x: 250,
            y: 150,
            color: 'rgb(234, 179, 8)', // yellow-500
            radius: 30 + safeScore(data.personal_wealth_score) * 3,
          },
          {
            id: 'personal.peace',
            name: 'Peace',
            subdomain: 'peace',
            fullName: 'Personal Peace',
            score: safeScore(data.personal_peace_score),
            x: 150,
            y: 200,
            color: 'rgb(252, 211, 77)', // amber-300
            radius: 30 + safeScore(data.personal_peace_score) * 3,
          },

          // Business domains
          {
            id: 'business.users',
            name: 'Users',
            subdomain: 'users',
            fullName: 'Business Users',
            score: safeScore(data.business_users_score),
            x: 400,
            y: 100,
            color: 'rgb(20, 184, 166)', // teal-500
            radius: 30 + safeScore(data.business_users_score) * 3,
          },
          {
            id: 'business.admin',
            name: 'Admin',
            subdomain: 'admin',
            fullName: 'Business Admin',
            score: safeScore(data.business_admin_score),
            x: 500,
            y: 150,
            color: 'rgb(6, 182, 212)', // cyan-500
            radius: 30 + safeScore(data.business_admin_score) * 3,
          },
          {
            id: 'business.profit',
            name: 'Profit',
            subdomain: 'profit',
            fullName: 'Business Profit',
            score: safeScore(data.business_profit_score),
            x: 400,
            y: 200,
            color: 'rgb(34, 211, 238)', // cyan-400
            radius: 30 + safeScore(data.business_profit_score) * 3,
          },

          // Supermind domains
          {
            id: 'supermind.vision',
            name: 'Vision',
            subdomain: 'vision',
            fullName: 'Supermind Vision',
            score: safeScore(data.supermind_vision_score),
            x: 275,
            y: 50,
            color: 'rgb(139, 92, 246)', // violet-500
            radius: 30 + safeScore(data.supermind_vision_score) * 3,
          },
          {
            id: 'supermind.planning',
            name: 'Planning',
            subdomain: 'planning',
            fullName: 'Supermind Planning',
            score: safeScore(data.supermind_planning_score),
            x: 325,
            y: 250,
            color: 'rgb(168, 85, 247)', // purple-500
            radius: 30 + safeScore(data.supermind_planning_score) * 3,
          },
          {
            id: 'supermind.execution',
            name: 'Execution',
            subdomain: 'execution',
            fullName: 'Supermind Execution',
            score: safeScore(data.supermind_execution_score),
            x: 200,
            y: 275,
            color: 'rgb(236, 72, 153)', // fuchsia-500
            radius: 30 + safeScore(data.supermind_execution_score) * 3,
          },
        ];

        setDomains(domainData);

        // Generate connections between domains
        const connectionData: Connection[] = [];

        // Connect within domain groups
        // Personal connections
        connectionData.push({
          source: 'personal.health',
          target: 'personal.wealth',
          strength:
            (safeScore(data.personal_health_score) + safeScore(data.personal_wealth_score)) / 20,
          opportunity: false,
        });
        connectionData.push({
          source: 'personal.wealth',
          target: 'personal.peace',
          strength:
            (safeScore(data.personal_wealth_score) + safeScore(data.personal_peace_score)) / 20,
          opportunity: false,
        });
        connectionData.push({
          source: 'personal.peace',
          target: 'personal.health',
          strength:
            (safeScore(data.personal_peace_score) + safeScore(data.personal_health_score)) / 20,
          opportunity: false,
        });

        // Business connections
        connectionData.push({
          source: 'business.users',
          target: 'business.admin',
          strength:
            (safeScore(data.business_users_score) + safeScore(data.business_admin_score)) / 20,
          opportunity: false,
        });
        connectionData.push({
          source: 'business.admin',
          target: 'business.profit',
          strength:
            (safeScore(data.business_admin_score) + safeScore(data.business_profit_score)) / 20,
          opportunity: false,
        });
        connectionData.push({
          source: 'business.profit',
          target: 'business.users',
          strength:
            (safeScore(data.business_profit_score) + safeScore(data.business_users_score)) / 20,
          opportunity: false,
        });

        // Supermind connections
        connectionData.push({
          source: 'supermind.vision',
          target: 'supermind.planning',
          strength:
            (safeScore(data.supermind_vision_score) + safeScore(data.supermind_planning_score)) /
            20,
          opportunity: false,
        });
        connectionData.push({
          source: 'supermind.planning',
          target: 'supermind.execution',
          strength:
            (safeScore(data.supermind_planning_score) + safeScore(data.supermind_execution_score)) /
            20,
          opportunity: false,
        });
        connectionData.push({
          source: 'supermind.execution',
          target: 'supermind.vision',
          strength:
            (safeScore(data.supermind_execution_score) + safeScore(data.supermind_vision_score)) /
            20,
          opportunity: false,
        });

        // Add integration opportunities from profile
        if (data.integration_path?.integration_opportunities) {
          data.integration_path.integration_opportunities.forEach((opportunity: any) => {
            const sourceId = `${opportunity.from_domain}.${opportunity.from_subdomain}`;
            const targetId = `${opportunity.to_domain}.${opportunity.to_subdomain}`;

            connectionData.push({
              source: sourceId,
              target: targetId,
              strength: 0.7, // Strong connection for opportunities
              opportunity: true,
            });
          });
        }

        setConnections(connectionData);

        // Fetch recommended exercises
        if (hasUser(supabaseHook)) {
          // At this point, hasUser(supabaseHook) guarantees user is not null
          const { data: exercisesData, error: exercisesError } = await supabase.rpc(
            'get_recommended_exercises',
            { p_user_id: supabaseHook.user!.id }
          );

          if (exercisesError) throw exercisesError;
          setRecommendedExercises(exercisesData || []);
        }
      } catch (error) {
        console.error('Error fetching integration profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [supabase, user, supabaseHook]);

  const handleDomainClick = (domain: Domain) => {
    setSelectedDomain(domain);
  };

  const getConnectedDomains = (domainId: string) => {
    return connections
      .filter(conn => conn.source === domainId || conn.target === domainId)
      .map(conn => (conn.source === domainId ? conn.target : conn.source));
  };

  const getExercisesForDomain = (domain: Domain) => {
    return recommendedExercises.filter(
      exercise =>
        exercise.domain === domain.id.split('.')[0] && exercise.subdomain === domain.subdomain
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile || !profile.assessment_completed) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Integration Map</CardTitle>
          <CardDescription>
            Complete your integration assessment to see your personalized integration map.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href="/integration/assessment">Take Assessment</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Your Integration Map</CardTitle>
          <CardDescription>
            This map shows how your different domains are integrated. Larger circles indicate
            stronger areas, while dashed lines show integration opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-slate-50 rounded-lg p-4 h-[450px] overflow-hidden">
            <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 600 400">
              {/* Connection lines */}
              {connections.map((connection, i) => {
                const source = domains.find(d => d.id === connection.source);
                const target = domains.find(d => d.id === connection.target);

                if (!source || !target) return null;

                const isHighlighted =
                  selectedDomain &&
                  (connection.source === selectedDomain.id ||
                    connection.target === selectedDomain.id);

                return (
                  <line
                    key={`connection-${i}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={connection.opportunity ? '#6366F1' : '#94A3B8'}
                    strokeWidth={connection.strength * 5}
                    strokeOpacity={isHighlighted ? 0.8 : 0.3}
                    strokeDasharray={connection.opportunity ? '5,5' : '0'}
                  />
                );
              })}

              {/* Domain circles */}
              {domains.map(domain => {
                const isPrimary = profile?.primary_integration_need === domain.id;
                const isSelected = selectedDomain?.id === domain.id;
                const isConnected =
                  selectedDomain && getConnectedDomains(selectedDomain.id).includes(domain.id);

                return (
                  <g key={domain.id}>
                    <motion.circle
                      cx={domain.x}
                      cy={domain.y}
                      r={domain.radius}
                      fill={domain.color}
                      fillOpacity={isPrimary ? 0.9 : isSelected ? 0.8 : isConnected ? 0.6 : 0.4}
                      stroke={isPrimary ? '#000' : 'none'}
                      strokeWidth={isPrimary ? 2 : 0}
                      onClick={() => handleDomainClick(domain)}
                      style={{ cursor: 'pointer' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    />
                    <text
                      x={domain.x}
                      y={domain.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontWeight={isPrimary ? 'bold' : 'normal'}
                      fontSize={isPrimary ? '14px' : '12px'}
                      onClick={() => handleDomainClick(domain)}
                      style={{ cursor: 'pointer' }}
                    >
                      {domain.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Domain info overlay */}
            {selectedDomain && (
              <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-md w-64">
                <h3 className="font-bold text-lg" style={{ color: selectedDomain.color }}>
                  {selectedDomain.fullName}
                </h3>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${selectedDomain.score * 10}%`,
                        backgroundColor: selectedDomain.color,
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {selectedDomain.score.toFixed(1)}
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-medium">Connected with:</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getConnectedDomains(selectedDomain.id).map(connectedId => {
                      const connectedDomain = domains.find(d => d.id === connectedId);
                      if (!connectedDomain) return null;

                      const connection = connections.find(
                        c =>
                          (c.source === selectedDomain.id && c.target === connectedId) ||
                          (c.source === connectedId && c.target === selectedDomain.id)
                      );

                      return (
                        <span
                          key={connectedId}
                          className="text-xs px-2 py-1 rounded-full text-white"
                          style={{
                            backgroundColor: connectedDomain.color,
                            border: connection?.opportunity ? '1px dashed white' : 'none',
                          }}
                        >
                          {connectedDomain.name}
                          {connection?.opportunity && ' ✦'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Recommended Integration Exercises</CardTitle>
          <CardDescription>
            Based on your assessment, we recommend these exercises to improve your integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendedExercises.length > 0 ? (
              recommendedExercises.map(exercise => {
                const domain = domains.find(
                  d => d.id === `${exercise.domain}.${exercise.subdomain}`
                );

                return (
                  <div
                    key={exercise.exercise_id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium text-lg">{exercise.title}</h3>
                      <span
                        className="text-xs px-2 py-1 rounded-full text-white"
                        style={{ backgroundColor: domain?.color || '#94A3B8' }}
                      >
                        {exercise.domain} › {exercise.subdomain}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{exercise.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-4">{exercise.duration_minutes} min</span>
                        <span>{exercise.difficulty}</span>
                      </div>
                      <Button asChild size="sm">
                        <a href={`/integration/exercises/${exercise.exercise_id}`}>
                          Start <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No exercises found. Complete your assessment to get recommendations.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
