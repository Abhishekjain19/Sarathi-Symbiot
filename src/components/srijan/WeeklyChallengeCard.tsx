
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

type Challenge = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
};

type WeeklyChallengeCardProps = {
  challenge: Challenge | null;
  isLoading: boolean;
};

export const WeeklyChallengeCard = ({ challenge, isLoading }: WeeklyChallengeCardProps) => {
  const { profile } = useAuth();
  
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-secondary/20 to-primary/20 border-secondary/20 mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-40 bg-secondary/20" />
            <Skeleton className="h-6 w-32 bg-secondary/20" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-5 w-64 bg-secondary/20 mb-2" />
          <Skeleton className="h-4 w-full bg-secondary/20 mb-1" />
          <Skeleton className="h-4 w-3/4 bg-secondary/20" />
        </CardContent>
      </Card>
    );
  }
  
  if (!challenge) return null;
  
  const daysRemaining = () => {
    const endDate = new Date(challenge.end_date);
    const today = new Date();
    const differenceInTime = endDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  };
  
  return (
    <Card className="bg-gradient-to-r from-secondary/20 to-primary/20 border-secondary/20 mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Weekly Challenge
            <Badge className="ml-2 bg-secondary text-secondary-foreground">
              {daysRemaining()} days remaining
            </Badge>
          </CardTitle>
          
          {profile?.role === "ngo" && (
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-secondary/20"
              onClick={() => {
                // In a real app, this would open a modal to edit the challenge
                console.log("Edit challenge");
              }}
            >
              Edit Challenge
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-base font-medium mb-2">{challenge.title}</h3>
        <p className="text-sm">{challenge.description}</p>
      </CardContent>
    </Card>
  );
};
