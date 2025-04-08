import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

interface SuperpuzzleCardProps {
  superpuzzle: {
    id: string;
    name: string;
    description?: string;
    token_id: string;
    required_points: number;
    status: 'active' | 'completed';
    created_at: string;
    tokens: {
      id: string;
      name: string;
      symbol: string;
      color: string;
    };
  };
  contribution?: {
    id: string;
    points: number;
    isCompleted: boolean;
    progress: number;
  };
  showContributeButton?: boolean;
  teamId?: string;
}

export const SuperpuzzleCard: React.FC<SuperpuzzleCardProps> = ({ 
  superpuzzle, 
  contribution, 
  showContributeButton = false,
  teamId
}) => {
  // Get gradient class based on token symbol
  const getGradientClass = (symbol: string) => {
    switch (symbol) {
      case 'SPD': // Sunday
        return 'from-red-500 via-green-500 to-blue-500';
      case 'SHE': // Monday
        return 'from-rose-500 via-red-500 to-orange-500';
      case 'PSP': // Tuesday
        return 'from-amber-500 to-yellow-500';
      case 'SSA': // Wednesday
        return 'from-lime-500 via-green-500 to-emerald-500';
      case 'BSP': // Thursday
        return 'from-teal-500 to-cyan-500';
      case 'SGB': // Friday
        return 'from-sky-500 via-blue-500 to-indigo-500';
      case 'SMS': // Saturday
        return 'from-violet-500 via-purple-500 to-fuchsia-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const gradientClass = getGradientClass(superpuzzle.tokens.symbol);
  const isCompleted = contribution?.isCompleted || superpuzzle.status === 'completed';
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className={`bg-gradient-to-r ${gradientClass} text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{superpuzzle.name}</CardTitle>
            <CardDescription className="text-white text-opacity-90">
              {superpuzzle.tokens.name} ({superpuzzle.tokens.symbol})
            </CardDescription>
          </div>
          <Badge variant={isCompleted ? "secondary" : "outline"} className="ml-2 text-white border-white">
            {isCompleted ? "Completed" : "Active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 mb-4">
          {superpuzzle.description || "No description provided."}
        </p>
        
        {contribution && (
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{contribution.points} / {superpuzzle.required_points} points</span>
            </div>
            <Progress value={contribution.progress} className="h-2" />
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Required: {superpuzzle.required_points} points</span>
          <span>Created {formatDistanceToNow(new Date(superpuzzle.created_at), { addSuffix: true })}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-slate-50">
        <Link href={`/superpuzzles/${superpuzzle.id}`} passHref>
          <Button variant="outline">View Details</Button>
        </Link>
        
        {showContributeButton && !isCompleted && teamId && (
          <Link href={`/superpuzzles/${superpuzzle.id}/contribute?teamId=${teamId}`} passHref>
            <Button className={`bg-gradient-to-r ${gradientClass} text-white`}>
              Contribute
            </Button>
          </Link>
        )}
        
        {isCompleted && (
          <Badge variant="default" className={`bg-gradient-to-r ${gradientClass} text-white`}>
            Completed!
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default SuperpuzzleCard;
