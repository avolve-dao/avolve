"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardWidgetsProps {
  userId: string;
}

interface Widget {
  id: string;
  title: string;
  description: string;
  link: string;
  buttonText: string;
}

export function DashboardWidgets({ userId }: DashboardWidgetsProps) {
  const supabase = createClient();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWidgets = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // Define the dashboard widgets
        const dashboardWidgets: Widget[] = [
          {
            id: "identity",
            title: "Identity",
            description: "View and manage your identity and profile.",
            link: "/profile",
            buttonText: "View Profile"
          },
          {
            id: "economy",
            title: "Economy",
            description: "Manage your tokens and view your economic activity.",
            link: "/tokens",
            buttonText: "View Tokens"
          },
          {
            id: "governance",
            title: "Governance",
            description: "Participate in governance and decision-making.",
            link: "/governance",
            buttonText: "View Proposals"
          }
        ];
        
        setWidgets(dashboardWidgets);
      } catch (error) {
        console.error('Error fetching widgets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWidgets();
  }, [userId]);

  if (isLoading) {
    return null; // Handled by Suspense
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {widgets.map(widget => (
        <Card key={widget.id}>
          <CardHeader>
            <CardTitle>{widget.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{widget.description}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href={widget.link}>{widget.buttonText}</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
