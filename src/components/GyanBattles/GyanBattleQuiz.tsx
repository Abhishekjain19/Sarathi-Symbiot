
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

// Fallback questions if API fails
const fallbackQuestions = {
  "4th": [
    {
      question: "What is the capital of India?",
      options: ["Mumbai", "Delhi", "Chennai", "Kolkata"],
      answer: 1
    },
    {
      question: "Which animal is known as the 'Ship of the Desert'?",
      options: ["Horse", "Camel", "Elephant", "Donkey"],
      answer: 1
    },
    {
      question: "How many days are there in a week?",
      options: ["5", "6", "7", "8"],
      answer: 2
    }
  ],
  "5th": [
    {
      question: "Who wrote the Indian national anthem?",
      options: ["Rabindranath Tagore", "Mahatma Gandhi", "Jawaharlal Nehru", "Sarojini Naidu"],
      answer: 0
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Jupiter", "Mars", "Saturn"],
      answer: 2
    },
    {
      question: "What is the largest organ in the human body?",
      options: ["Heart", "Brain", "Liver", "Skin"],
      answer: 3
    }
  ],
  "middle": [
    {
      question: "What is the chemical formula for water?",
      options: ["H2O", "CO2", "O2", "H2SO4"],
      answer: 0
    },
    {
      question: "Which of these is not a type of rock?",
      options: ["Igneous", "Sedimentary", "Metamorphic", "Herbaceous"],
      answer: 3
    },
    {
      question: "What is the smallest prime number?",
      options: ["0", "1", "2", "3"],
      answer: 2
    }
  ],
  "high": [
    {
      question: "Which of these scientists developed the theory of relativity?",
      options: ["Isaac Newton", "Albert Einstein", "Stephen Hawking", "Galileo Galilei"],
      answer: 1
    },
    {
      question: "What is the Pythagorean theorem?",
      options: ["a² = b² + c²", "a² + b² = c²", "a + b = c", "a × b = c²"],
      answer: 1
    },
    {
      question: "Which of these is not a programming language?",
      options: ["Python", "JavaScript", "Photoshop", "Java"],
      answer: 2
    }
  ]
};

// Get appropriate fallback questions based on grade
const getFallbackQuestions = (grade: string) => {
  // Convert grade formats like "4th" to number 4
  const gradeNumber = parseInt(grade?.replace(/[^0-9]/g, '') || "5");
  
  if (gradeNumber <= 4) return fallbackQuestions["4th"];
  if (gradeNumber === 5) return fallbackQuestions["5th"];
  if (gradeNumber <= 8) return fallbackQuestions["middle"];
  return fallbackQuestions["high"];
};

// Calculate difficulty based on grade (for API requests)
const calculateDifficulty = (grade: string): string => {
  const gradeNumber = parseInt(grade?.replace(/[^0-9]/g, '') || "5");
  
  if (gradeNumber <= 5) {
    return "elementary";
  } else if (gradeNumber <= 8) {
    return "intermediate";
  } else if (gradeNumber <= 10) {
    return "advanced";
  } else {
    return "expert";
  }
};

interface Question {
  question: string;
  options: string[];
  answer: number;
}

interface GyanBattleQuizProps {
  topic: string;
  onComplete: (score: number, total: number) => void;
  apiKey?: string;
}

// OpenRouter API configuration
const API_HOST = "https://openrouter.ai/api/v1";
const API_KEY = "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";

const GyanBattleQuiz = ({ 
  topic, 
  onComplete,
  apiKey = API_KEY
}: GyanBattleQuizProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        // Get difficulty based on user's grade
        const difficulty = calculateDifficulty(profile?.grade || "5th");
        
        const prompt = `Generate 5 multiple-choice quiz questions about ${topic}. 
          Difficulty level: ${difficulty} (for ${profile?.grade || "5th"} grade students).
          Format your response as a JSON array with question, options (array of 4 choices), and answer (index of correct option, 0-based).
          Example: [{"question": "What is 2+2?", "options": ["3", "4", "5", "6"], "answer": 1}]`;

        const response = await fetch(`${API_HOST}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are an educational quiz creator for children. Create age-appropriate, factually accurate questions."
              },
              { role: "user", content: prompt }
            ],
            max_tokens: 1000
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
          throw new Error("No content in response");
        }

        // Extract JSON from the response
        let jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          // Try to find JSON without brackets
          jsonMatch = content.match(/{[\s\S]*}/);
          if (jsonMatch) {
            jsonMatch[0] = `[${jsonMatch[0]}]`;
          } else {
            throw new Error("Could not extract JSON from response");
          }
        }
        
        const parsedQuestions = JSON.parse(jsonMatch[0]);
        
        // Validate questions format
        const validQuestions = parsedQuestions.filter((q: any) => 
          q.question && Array.isArray(q.options) && q.options.length === 4 && 
          typeof q.answer === 'number' && q.answer >= 0 && q.answer < 4
        );

        if (validQuestions.length === 0) {
          throw new Error("No valid questions in response");
        }

        setQuestions(validQuestions);
        setApiError(null);
      } catch (error) {
        console.error("Error generating quiz:", error);
        setApiError(`Failed to generate questions: ${(error as Error).message}`);
        
        // Use fallback questions based on grade level
        const fallbackSet = getFallbackQuestions(profile?.grade || "5th");
        
        toast({
          title: "Using fallback questions",
          description: "We couldn't connect to our quiz service. Using basic questions instead.",
          variant: "default", // Changed from "warning" to "default"
          duration: 4000,
        });
        
        setQuestions(fallbackSet);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [topic, apiKey, toast, profile?.grade]);

  // Start timer when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !isAnswered) {
      setTimeLeft(15);
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsAnswered(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [questions.length, currentQuestionIndex, isAnswered]);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Check if answer is correct
    const currentQuestion = questions[currentQuestionIndex];
    if (index === currentQuestion.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz complete
      onComplete(score, questions.length);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground text-center">Generating {topic} quiz questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="p-6 bg-sarathi-darkCard border-sarathi-gray/30">
        <div className="flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold mb-2">Failed to Load Questions</h3>
          <p className="text-center text-muted-foreground mb-4">
            We couldn't generate questions for this topic. Please try again or select a different topic.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <span className="text-sm font-medium">
          Score: {score}/{currentQuestionIndex}
        </span>
      </div>
      
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-muted-foreground">Time remaining:</span>
        <span className="text-sm font-medium">{timeLeft}s</span>
      </div>
      
      <Progress value={(timeLeft / 15) * 100} className="h-2" />
      
      <Card className="p-6 bg-sarathi-darkCard border-sarathi-gray/30">
        <h3 className="text-xl font-medium mb-6">{currentQuestion.question}</h3>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className={`w-full justify-start text-left p-4 ${
                isAnswered && index === currentQuestion.answer
                  ? "bg-green-600/20 border-green-500/50"
                  : isAnswered && index === selectedOption && index !== currentQuestion.answer
                  ? "bg-red-600/20 border-red-500/50"
                  : ""
              }`}
              onClick={() => handleOptionSelect(index)}
              disabled={isAnswered}
            >
              <span className="mr-2">{String.fromCharCode(65 + index)}.</span> {option}
            </Button>
          ))}
        </div>
      </Card>
      
      {isAnswered && (
        <div className="flex justify-end">
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GyanBattleQuiz;
