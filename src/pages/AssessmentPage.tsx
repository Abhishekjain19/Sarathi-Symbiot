
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/App";
import { OfflineStatus } from "@/components/OfflineStatus";

// Mock test data
const testData = {
  id: "1",
  title: "Physics Weekly Test: Newton's Laws",
  totalQuestions: 10,
  timeLimit: 30, // in minutes
  questions: [
    {
      id: 1,
      text: "Which of Newton's laws states that an object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force?",
      options: [
        { id: "a", text: "First Law" },
        { id: "b", text: "Second Law" },
        { id: "c", text: "Third Law" },
        { id: "d", text: "Fourth Law" }
      ],
      correctAnswer: "a"
    },
    {
      id: 2,
      text: "The formula F=ma represents which of Newton's laws?",
      options: [
        { id: "a", text: "First Law" },
        { id: "b", text: "Second Law" },
        { id: "c", text: "Third Law" },
        { id: "d", text: "None of the above" }
      ],
      correctAnswer: "b"
    },
    {
      id: 3,
      text: "For every action, there is an equal and opposite reaction. This statement represents:",
      options: [
        { id: "a", text: "First Law" },
        { id: "b", text: "Second Law" },
        { id: "c", text: "Third Law" },
        { id: "d", text: "Law of Conservation of Energy" }
      ],
      correctAnswer: "c"
    },
  ]
};

const AssessmentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(testData.timeLimit * 60); // in seconds
  const [answerLocked, setAnswerLocked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  // Timer effect
  useEffect(() => {
    if (isTestStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTestStarted, timeLeft]);

  // Answer lock effect (anti-cheat)
  useEffect(() => {
    if (isTestStarted && selectedAnswers[currentQuestion + 1]) {
      const lockTimer = setTimeout(() => {
        setAnswerLocked({
          ...answerLocked,
          [currentQuestion + 1]: true
        });
      }, 20000); // 20 seconds to answer
      return () => clearTimeout(lockTimer);
    }
  }, [currentQuestion, isTestStarted, selectedAnswers, answerLocked]);

  const handleBack = () => {
    if (isTestStarted) {
      // Show confirmation dialog
      if (window.confirm("Are you sure you want to exit? Your progress will be lost.")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const handleStartTest = () => {
    setIsTestStarted(true);
  };

  const handleSelectAnswer = (questionId: number, optionId: string) => {
    if (answerLocked[questionId]) return; // Don't allow changes if locked
    
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitTest = () => {
    // In a real app, would send answers to server
    alert("Test submitted successfully! Your answers will be synced when you're next online.");
    navigate(-1);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentQuestionData = testData.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container max-w-2xl mx-auto px-4 py-6 pb-20">
        <button 
          onClick={handleBack}
          className="flex items-center text-sm text-muted-foreground mb-4"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        
        {!isTestStarted ? (
          <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
            <CardContent className="pt-6">
              <h1 className="text-xl font-bold mb-4">{testData.title}</h1>
              
              <div className="grid gap-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions:</span>
                  <span>{testData.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Limit:</span>
                  <span>{testData.timeLimit} minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Connection Status:</span>
                  <OfflineStatus />
                </div>
              </div>
              
              <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-3 mb-6">
                <div className="flex gap-2">
                  <AlertCircle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-500">Important Information</p>
                    <ul className="text-xs text-yellow-400 list-disc list-inside mt-1">
                      <li>Answers will be locked after 20 seconds for each question</li>
                      <li>Test results will be synced when you're next online</li>
                      <li>Do not leave the test once started</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full sarathi-button"
                onClick={handleStartTest}
              >
                Start Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div>
            {/* Test Header */}
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg font-medium">{testData.title}</h1>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} />
                <span className={timeLeft < 60 ? "text-red-400 animate-pulse-soft" : ""}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Question {currentQuestion + 1} of {testData.questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / testData.questions.length) * 100)}%</span>
              </div>
              <Progress 
                value={((currentQuestion + 1) / testData.questions.length) * 100} 
                className="h-1.5"
              />
            </div>
            
            {/* Question */}
            <Card className="bg-sarathi-darkCard border-sarathi-gray/30 mb-4">
              <CardContent className="pt-6">
                <p className="text-lg mb-6">
                  {currentQuestionData.text}
                </p>
                
                <RadioGroup 
                  value={selectedAnswers[currentQuestionData.id] || ""}
                  className="space-y-3"
                >
                  {currentQuestionData.options.map((option) => (
                    <div key={option.id} className="flex items-center">
                      <RadioGroupItem 
                        value={option.id} 
                        id={`option-${option.id}`}
                        disabled={answerLocked[currentQuestionData.id]}
                        onClick={() => handleSelectAnswer(currentQuestionData.id, option.id)}
                      />
                      <Label 
                        htmlFor={`option-${option.id}`} 
                        className="ml-2 cursor-pointer"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                {answerLocked[currentQuestionData.id] && (
                  <div className="mt-4 bg-yellow-600/20 p-2 rounded text-xs text-yellow-500 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    Answer locked for this question
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Navigation */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              
              {currentQuestion < testData.questions.length - 1 ? (
                <Button onClick={handleNextQuestion}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmitTest}>
                  Submit Test
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AssessmentPage;
