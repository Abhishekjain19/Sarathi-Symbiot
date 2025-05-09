import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Share2,
  Star, 
  BarChart2,
  Volume2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const OPENROUTE_API_KEY = "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";

interface GyanBattleResultsProps {
  results: {
    score: number;
    oppScore: number;
    totalQuestions: number;
    topic: string;
    language: string;
    date: string;
  };
  onPlayAgain: () => void;
}

// Fallback performance reviews in case API fails
const getFallbackReview = (score: number, totalPossible: number, gameResult: string): string => {
  const percentage = Math.round((score / totalPossible) * 100);
  
  if (gameResult === 'win') {
    return "Congratulations on your victory! Your knowledge power shines brightly today. Keep up the great work!";
  } else if (gameResult === 'lose') {
    return "Nice effort, but the AI got the better of you this time! Practice makes perfect - come back for a rematch!";
  } else {
    return "A perfect tie! Great minds think alike. Challenge yourself again to break the deadlock!";
  }
};

export const GyanBattleResults = ({
  results,
  onPlayAgain
}: GyanBattleResultsProps) => {
  const [performanceReview, setPerformanceReview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [badges, setBadges] = useState<{name: string, earned: boolean}[]>([]);
  
  // Calculate score percentage
  const scorePercentage = results.totalQuestions > 0 
    ? Math.round((results.score / (results.totalQuestions * 10)) * 100)
    : 0;
  
  // Determine win/lose/draw status
  const gameResult = results.score > results.oppScore 
    ? 'win' 
    : results.score < results.oppScore 
    ? 'lose' 
    : 'draw';

  // Generate AI performance review with better error handling
  useEffect(() => {
    const generatePerformanceReview = async () => {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTE_API_KEY}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "Sarathi Learning Platform - Gyan Battles",
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo", // Using 3.5 instead of 4o to reduce token usage
            max_tokens: 150, // Limiting token usage
            messages: [
              {
                role: "system",
                content: `You are a fun, witty AI game host for an educational quiz app called Gyan Battles.
                You need to provide a short, entertaining performance review for a player who just finished a quiz.
                Be encouraging but playful, with some light teasing. Keep your response to 2-3 sentences maximum.`
              },
              {
                role: "user",
                content: `Player scored ${results.score} points out of a possible ${results.totalQuestions * 10} 
                (${scorePercentage}%) on a quiz about ${results.topic}. The AI opponent scored ${results.oppScore} points,
                so the player ${gameResult === 'win' ? 'won' : gameResult === 'lose' ? 'lost' : 'tied'}.
                Give a short, fun performance review.`
              }
            ]
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || "Error from OpenRouter API");
        }
        
        // Safely extract the content
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("No content returned from API");
        }
        
        setPerformanceReview(content.trim());
        
        // Determine earned badges
        const newBadges = [
          {
            name: "Victory",
            earned: gameResult === 'win'
          },
          {
            name: "Perfect Score",
            earned: scorePercentage === 100
          },
          {
            name: "Knowledge Seeker",
            earned: true // Everyone gets this for playing
          },
          {
            name: "Quick Thinker",
            earned: Math.random() > 0.5 // Random for demo purposes
          },
          {
            name: `${results.topic} Expert`,
            earned: scorePercentage >= 80
          },
        ];
        
        setBadges(newBadges);
        setIsLoading(false);
      } catch (error) {
        console.error("Error generating performance review:", error);
        
        // Use fallback performance review when API fails
        const fallbackReview = getFallbackReview(results.score, results.totalQuestions * 10, gameResult);
        setPerformanceReview(fallbackReview);
        
        // Set standard badges
        const newBadges = [
          {
            name: "Victory",
            earned: gameResult === 'win'
          },
          {
            name: "Perfect Score",
            earned: scorePercentage === 100
          },
          {
            name: "Knowledge Seeker",
            earned: true // Everyone gets this for playing
          },
          {
            name: `${results.topic} Expert`,
            earned: scorePercentage >= 80
          },
        ];
        
        setBadges(newBadges);
        setIsLoading(false);
      }
    };

    generatePerformanceReview();
  }, [results, gameResult, scorePercentage]);

  const handleShareResult = () => {
    // In a real app, this would generate a shareable link
    // For now, we'll just show the dialog
    setShowShareDialog(true);
  };
  
  const copyToClipboard = () => {
    const shareText = `I just scored ${results.score} points in Gyan Battles on the topic of ${results.topic}! Can you beat my score?`;
    navigator.clipboard.writeText(shareText)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Challenge text copied! Share it with your friends.",
          duration: 2000,
        });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center relative">
        <div className={`absolute inset-0 flex items-center justify-center -z-10 opacity-10 text-9xl`}>
          {gameResult === 'win' && "🏆"}
          {gameResult === 'lose' && "😢"}
          {gameResult === 'draw' && "🤝"}
        </div>
        
        <h2 className="text-2xl font-bold mb-2">
          {gameResult === 'win' && "Victory!"}
          {gameResult === 'lose' && "Defeat"}
          {gameResult === 'draw' && "It's a Draw"}
        </h2>
        
        <p className="text-sarathi-gray">
          Topic: <span className="text-white font-medium">{results.topic}</span>
        </p>
      </div>
      
      <Card className="bg-sarathi-darkCard/60 border-sarathi-gray/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-center">
              <p className="text-sm text-sarathi-gray">Your Score</p>
              <p className="text-3xl font-bold">{results.score}</p>
            </div>
            
            <div className="text-2xl font-bold">VS</div>
            
            <div className="text-center">
              <p className="text-sm text-sarathi-gray">AI Score</p>
              <p className="text-3xl font-bold">{results.oppScore}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-sarathi-gray">Your Performance</span>
                <span className="text-sm font-medium">{scorePercentage}%</span>
              </div>
              <Progress value={scorePercentage} className="h-2" />
            </div>
            
            <div className="p-4 bg-sarathi-primary/10 rounded-md border border-sarathi-primary/30">
              {isLoading ? (
                <div className="flex items-center justify-center h-12">
                  <div className="animate-pulse w-full h-4 bg-sarathi-gray/20 rounded"></div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Trophy size={24} className="text-yellow-500" />
                  </div>
                  <p className="italic">{performanceReview}</p>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(performanceReview);
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                  >
                    <Volume2 size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-3 flex items-center">
              <Star size={16} className="mr-2 text-yellow-500" />
              Achievements Earned
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {badges.map(badge => (
                <div 
                  key={badge.name}
                  className={`text-center p-2 rounded-md border ${
                    badge.earned 
                      ? 'bg-sarathi-primary/20 border-sarathi-primary/40' 
                      : 'bg-sarathi-dark/40 border-sarathi-gray/20 opacity-50'
                  }`}
                >
                  <div className="text-sm font-medium">{badge.name}</div>
                  <div className="text-xs text-sarathi-gray">
                    {badge.earned ? 'Earned' : 'Not earned'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Button 
          onClick={onPlayAgain}
          size="lg"
          className="flex items-center space-x-2"
        >
          <Trophy size={16} />
          <span>Play Again</span>
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleShareResult}
          size="lg"
          className="flex items-center space-x-2"
        >
          <Share2 size={16} />
          <span>Challenge Friends</span>
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => {
            // In a real implementation, this would navigate to the leaderboard
            toast({
              title: "Score Submitted",
              description: "Your score has been added to the leaderboard!",
              duration: 2000,
            });
          }}
          size="lg"
          className="flex items-center space-x-2"
        >
          <BarChart2 size={16} />
          <span>View Leaderboard</span>
        </Button>
      </div>
      
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Challenge Your Friends</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p>
              Share your Gyan Battle result and challenge your friends to beat your score of <strong>{results.score}</strong> in <strong>{results.topic}</strong>!
            </p>
            
            <div className="p-3 bg-sarathi-dark rounded-md">
              <p className="text-sm">
                I just scored {results.score} points in Gyan Battles on the topic of {results.topic}! Can you beat my score?
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button className="flex-1" onClick={copyToClipboard}>Copy Text</Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowShareDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
