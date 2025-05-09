import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Timer, 
  Zap, 
  Star, 
  Trophy, 
  Volume2,
  Volume1,
  VolumeX,
  SkipForward,
  Loader
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const OPENROUTE_API_KEY = "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";

interface GyanBattleQuizProps {
  topic: string;
  language: "english" | "hindi" | "kannada";
  onComplete: (results: any) => void;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface PowerUp {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  active: boolean;
  used: boolean;
}

// Fallback questions in case API fails
const getFallbackQuestions = (topic: string): Question[] => {
  return [
    {
      id: 1,
      text: `What is a key concept in ${topic}?`,
      options: ["Concept A", "Concept B", "Concept C", "Concept D"],
      correctAnswer: "Concept A",
      explanation: `Concept A is a fundamental principle in ${topic}.`
    },
    {
      id: 2,
      text: `Which of the following is associated with ${topic}?`,
      options: ["Element 1", "Element 2", "Element 3", "Element 4"],
      correctAnswer: "Element 2",
      explanation: `Element 2 is closely associated with ${topic} principles.`
    },
    {
      id: 3,
      text: `Who made significant contributions to ${topic}?`,
      options: ["Person A", "Person B", "Person C", "Person D"],
      correctAnswer: "Person C",
      explanation: `Person C made revolutionary contributions to ${topic}.`
    },
    {
      id: 4,
      text: `When did ${topic} become widely recognized?`,
      options: ["1950s", "1970s", "1990s", "2010s"],
      correctAnswer: "1970s",
      explanation: `${topic} gained widespread recognition during the 1970s.`
    },
    {
      id: 5,
      text: `What is an application of ${topic}?`,
      options: ["Application W", "Application X", "Application Y", "Application Z"],
      correctAnswer: "Application Y",
      explanation: `Application Y demonstrates the practical use of ${topic}.`
    }
  ];
};

export const GyanBattleQuiz = ({
  topic,
  language,
  onComplete
}: GyanBattleQuizProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [aiTaunt, setAiTaunt] = useState("");
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    {
      id: "skip",
      name: "Skip Question",
      icon: <SkipForward size={16} />,
      description: "Skip the current question without penalty",
      active: true,
      used: false
    },
    {
      id: "double",
      name: "Double Points",
      icon: <Star size={16} />,
      description: "Earn double points for correct answer",
      active: true,
      used: false
    },
    {
      id: "extra-time",
      name: "Extra Time",
      icon: <Timer size={16} />,
      description: "Add 15 seconds to the timer",
      active: true, 
      used: false
    }
  ]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isDoublePointsActive, setIsDoublePointsActive] = useState(false);
  const [oppScore, setOppScore] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );

  // Generate questions using OpenRouter API with better error handling
  useEffect(() => {
    const generateQuestions = async () => {
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
            max_tokens: 1000, // Limiting token usage
            messages: [
              {
                role: "system",
                content: `You are an educational quiz generator for a game called Gyan Battles. 
                Generate 5 challenging multiple-choice questions with 4 options each about ${topic}. 
                The language should be ${language}. Include an explanation for each correct answer.
                Format your response as a JSON array where each question object has: id, text, options (array of 4 strings), 
                correctAnswer (one of the option strings), and explanation.`
              }
            ],
            response_format: { type: "json_object" }
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || "Error from OpenRouter API");
        }
        
        // Safely parse the content with better error handling
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("No content returned from API");
        }
        
        const parsedContent = JSON.parse(content);
        const questionsData = parsedContent.questions || [];
        
        if (!Array.isArray(questionsData) || questionsData.length === 0) {
          throw new Error("No valid questions returned");
        }
        
        setQuestions(questionsData);
        setIsLoading(false);
        
        // Read first question aloud if sound is enabled
        if (isSoundEnabled && questionsData.length > 0) {
          speakText(questionsData[0].text);
        }
      } catch (error) {
        console.error("Error generating questions:", error);
        toast({
          title: "Using fallback questions",
          description: "We couldn't connect to our quiz service. Using basic questions instead.",
          variant: "warning",
          duration: 4000,
        });
        
        // Use fallback questions instead
        const fallbackQuestions = getFallbackQuestions(topic);
        setQuestions(fallbackQuestions);
        setIsLoading(false);
        
        // Read first fallback question aloud if sound is enabled
        if (isSoundEnabled && fallbackQuestions.length > 0) {
          speakText(fallbackQuestions[0].text);
        }
      }
    };

    generateQuestions();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, [topic, language, isSoundEnabled]);

  // Timer for each question
  useEffect(() => {
    if (isLoading || showAnswer) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLoading, currentQuestionIndex, showAnswer]);

  // Speech synthesis function with better error handling
  const speakText = (text: string) => {
    if (!speechSynthesisRef.current || !isSoundEnabled) return;
    
    try {
      speechSynthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language based on selection
      if (language === "hindi") {
        utterance.lang = "hi-IN";
      } else if (language === "kannada") {
        utterance.lang = "kn-IN";
      } else {
        utterance.lang = "en-US";
      }
      
      speechSynthesisRef.current.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis error:", error);
      // Continue without speech if there's an error
    }
  };

  // Handle timeout when time runs out
  const handleTimeout = () => {
    setShowAnswer(true);
    
    if (isSoundEnabled) {
      speakText("Time's up! You were too slow!");
    }
    
    setAiTaunt("Time's up! My AI brain works much faster than yours!");
    
    // Simulate opponent answering
    const oppCorrect = Math.random() > 0.4; // 60% chance opponent gets it right
    if (oppCorrect) {
      setOppScore(prev => prev + 10);
    }
    
    setTimeout(() => {
      moveToNextQuestion();
    }, 3000);
  };

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    if (selectedOption || showAnswer) return;
    
    setSelectedOption(option);
    setShowAnswer(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    
    // Determine points to award
    const pointsToAdd = isDoublePointsActive ? 20 : 10;
    
    if (isCorrect) {
      setScore(prev => prev + pointsToAdd);
      
      if (isDoublePointsActive) {
        setIsDoublePointsActive(false);
        toast({
          title: "Double Points Used",
          description: "You earned 20 points for that correct answer!",
          duration: 2000,
        });
      }
      
      // AI taunt for correct answer
      const correctTaunts = [
        "Lucky guess! The next one won't be so easy.",
        "Not bad! But I'm still smarter than you.",
        "You got that one right, but can you keep up?",
        "Impressive... for a human.",
      ];
      const randomTaunt = correctTaunts[Math.floor(Math.random() * correctTaunts.length)];
      setAiTaunt(randomTaunt);
      
      if (isSoundEnabled) {
        speakText(randomTaunt);
      }
    } else {
      // AI taunt for wrong answer
      const incorrectTaunts = [
        "Wrong! Did you even study?",
        "Ha! My algorithms are superior to your brain!",
        "That was an easy one. Keep up!",
        "Better luck next time, human!",
      ];
      const randomTaunt = incorrectTaunts[Math.floor(Math.random() * incorrectTaunts.length)];
      setAiTaunt(randomTaunt);
      
      if (isSoundEnabled) {
        speakText(randomTaunt);
      }
    }
    
    // Simulate opponent answering
    const oppDifficulty = 0.3; // Opponent has 70% chance of getting it right
    const oppCorrect = Math.random() > oppDifficulty;
    if (oppCorrect) {
      setOppScore(prev => prev + 10);
    }
    
    setTimeout(() => {
      moveToNextQuestion();
    }, 3000);
  };

  // Move to next question or end the quiz
  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
      setTimeLeft(20);
      setAiTaunt("");
      
      // Read the next question if sound is enabled
      if (isSoundEnabled) {
        speakText(questions[currentQuestionIndex + 1].text);
      }
    } else {
      // Quiz is complete
      const results = {
        score,
        oppScore,
        totalQuestions: questions.length,
        topic,
        language,
        date: new Date().toISOString(),
      };
      
      // Play final taunt based on who won
      if (score > oppScore) {
        if (isSoundEnabled) {
          speakText("You beat me this time, but I'll be back smarter next time!");
        }
      } else {
        if (isSoundEnabled) {
          speakText("Better luck next time! My AI intelligence wins again!");
        }
      }
      
      onComplete(results);
    }
  };

  // Use power-up
  const usePowerUp = (powerUpId: string) => {
    const updatedPowerUps = powerUps.map(p => {
      if (p.id === powerUpId) {
        return { ...p, active: false, used: true };
      }
      return p;
    });
    
    setPowerUps(updatedPowerUps);
    
    switch (powerUpId) {
      case "skip":
        // Skip current question
        toast({
          title: "Power-up Used",
          description: "Question skipped!",
          duration: 2000,
        });
        moveToNextQuestion();
        break;
        
      case "double":
        // Activate double points for next correct answer
        setIsDoublePointsActive(true);
        toast({
          title: "Power-up Used",
          description: "Double points activated for your next correct answer!",
          duration: 2000,
        });
        break;
        
      case "extra-time":
        // Add extra time
        setTimeLeft(prev => prev + 15);
        toast({
          title: "Power-up Used",
          description: "15 seconds added to the timer!",
          duration: 2000,
        });
        break;
    }
  };

  // Toggle sound
  const toggleSound = () => {
    setIsSoundEnabled(prev => !prev);
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

  // Read current question aloud
  const readQuestion = () => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      speakText(currentQuestion.text);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <Loader className="w-12 h-12 animate-spin text-primary mb-4" />
        <h3 className="text-xl font-semibold">Preparing Your Battle...</h3>
        <p className="text-sarathi-gray mt-2">Generating challenging questions about {topic}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-6">
        <h3 className="text-xl font-semibold mb-4">Failed to Load Questions</h3>
        <p className="mb-4">We couldn't generate questions for this topic. Please try again or select a different topic.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSound}
            title={isSoundEnabled ? "Mute sound" : "Enable sound"}
          >
            {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
          
          {isSoundEnabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={readQuestion}
              className="flex items-center space-x-1"
            >
              <Volume1 size={16} />
              <span>Read Question</span>
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-center">
            <div className="text-xs text-sarathi-gray">YOU</div>
            <div className="text-lg font-bold">{score}</div>
          </div>
          
          <div className="text-xl font-bold">VS</div>
          
          <div className="text-center">
            <div className="text-xs text-sarathi-gray">AI</div>
            <div className="text-lg font-bold">{oppScore}</div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Timer className="text-yellow-500" />
          <Progress value={(timeLeft / 20) * 100} className="w-32 h-2" />
          <span className="text-sm font-medium">{timeLeft}s</span>
        </div>
        
        <div className="text-sm font-medium">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>
      
      <Card className="bg-sarathi-darkCard/60 border-sarathi-gray/20">
        <CardContent className="p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            {currentQuestion.text}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestion.options.map((option, i) => (
              <Button
                key={i}
                variant={
                  showAnswer
                    ? option === currentQuestion.correctAnswer
                      ? "default"
                      : option === selectedOption
                      ? "destructive"
                      : "outline"
                    : selectedOption === option
                    ? "default"
                    : "outline"
                }
                className="justify-start h-auto py-3 text-left"
                onClick={() => handleOptionSelect(option)}
                disabled={showAnswer}
              >
                <span className="font-medium">{String.fromCharCode(65 + i)}. </span>
                <span className="ml-2">{option}</span>
              </Button>
            ))}
          </div>
          
          {showAnswer && (
            <div className="mt-4 p-3 bg-sarathi-dark/30 rounded-md border border-sarathi-gray/30">
              <p className="text-sm">
                <span className="font-semibold">Explanation: </span>
                {currentQuestion.explanation}
              </p>
            </div>
          )}
          
          {aiTaunt && (
            <div className="mt-4 p-3 bg-sarathi-primary/10 rounded-md border border-sarathi-primary/30 flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-sarathi-primary flex items-center justify-center flex-shrink-0">
                <Zap size={16} />
              </div>
              <p className="text-sm italic">{aiTaunt}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {powerUps.map((powerUp) => (
          <Button
            key={powerUp.id}
            variant="outline"
            size="sm"
            disabled={!powerUp.active || showAnswer}
            onClick={() => usePowerUp(powerUp.id)}
            className={`flex items-center space-x-1 ${!powerUp.active ? 'opacity-50' : ''}`}
            title={powerUp.description}
          >
            {powerUp.icon}
            <span>{powerUp.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
