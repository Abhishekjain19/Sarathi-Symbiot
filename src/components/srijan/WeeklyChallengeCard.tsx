
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/App";

// In a real app, this would come from the backend
const currentChallenge = {
  title: "Sustainable Water Conservation",
  description: "Create innovative solutions to help conserve water in daily life. Consider how we can reduce water wastage, recycle water, or create awareness about water conservation.",
  endDate: "2025-05-03T23:59:59Z",
  isActive: true,
};

export const WeeklyChallengeCard = () => {
  const { userRole } = useAuth();
  
  if (!currentChallenge.isActive) return null;
  
  const daysRemaining = () => {
    const endDate = new Date(currentChallenge.endDate);
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
          
          {userRole === "ngo" && (
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
        <h3 className="text-base font-medium mb-2">{currentChallenge.title}</h3>
        <p className="text-sm">{currentChallenge.description}</p>
      </CardContent>
    </Card>
  );
};
