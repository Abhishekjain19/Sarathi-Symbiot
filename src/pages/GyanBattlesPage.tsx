import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GyanWheel } from "@/components/GyanBattles/GyanWheel";
import GyanBattleQuiz from "@/components/GyanBattles/GyanBattleQuiz";
import { GyanBattleResults } from "@/components/GyanBattles/GyanBattleResults";
import { GyanBattleLeaderboard } from "@/components/GyanBattles/GyanBattleLeaderboard";
import { toast } from "@/components/ui/use-toast";

// Game stages
enum GameStage {
  SELECT_TOPIC,
  QUIZ,
  RESULTS,
}

const GyanBattlesPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [gameStage, setGameStage] = useState<GameStage>(GameStage.SELECT_TOPIC);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [language, setLanguage] = useState<"english" | "hindi" | "kannada">("english");
  const [score, setScore] = useState(0);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    if (!profile) {
      navigate("/auth");
    }
  }, [profile, navigate]);

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setGameStage(GameStage.QUIZ);
    toast({
      title: "Topic Selected",
      description: `Get ready for a quiz on ${topic}!`,
      duration: 3000,
    });
  };

  const handleQuizComplete = (results: any) => {
    setQuizResults(results);
    setScore(results.score);
    setGameStage(GameStage.RESULTS);
  };

  const startNewGame = () => {
    setSelectedTopic("");
    setScore(0);
    setQuizResults(null);
    setGameStage(GameStage.SELECT_TOPIC);
  };

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Gyan Battles - Single Player</h1>
          <div className="space-x-2">
            <Button 
              onClick={toggleLeaderboard}
              variant="outline"
            >
              {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
            </Button>
          </div>
        </div>

        {showLeaderboard ? (
          <GyanBattleLeaderboard onClose={toggleLeaderboard} />
        ) : (
          <Card className="bg-sarathi-darkCard border-sarathi-gray/30 p-6">
            {gameStage === GameStage.SELECT_TOPIC && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold mb-3">Choose Your Battle Topic</h2>
                  <p className="text-sarathi-gray">Spin the wheel or select a topic to start your quiz battle!</p>
                </div>
                
                <div className="flex justify-center">
                  <GyanWheel onTopicSelect={handleTopicSelect} />
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-2">Select Language</h3>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => setLanguage("english")} 
                      variant={language === "english" ? "default" : "outline"}
                    >
                      English
                    </Button>
                    <Button 
                      onClick={() => setLanguage("hindi")} 
                      variant={language === "hindi" ? "default" : "outline"}
                    >
                      Hindi
                    </Button>
                    <Button 
                      onClick={() => setLanguage("kannada")} 
                      variant={language === "kannada" ? "default" : "outline"}
                    >
                      Kannada
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {gameStage === GameStage.QUIZ && selectedTopic && (
              <GyanBattleQuiz 
                topic={selectedTopic} 
                language={language}
                onComplete={handleQuizComplete}
              />
            )}
            
            {gameStage === GameStage.RESULTS && quizResults && (
              <GyanBattleResults 
                results={quizResults}
                onPlayAgain={startNewGame}
              />
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default GyanBattlesPage;
