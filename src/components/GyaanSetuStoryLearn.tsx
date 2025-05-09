
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Book,
  Upload,
  Search,
  Volume2,
  Pause,
  Check,
  FileText
} from "lucide-react";

// Types for quiz questions
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
}

interface GyaanSetuStoryLearnProps {
  openrouterApiKey: string;
}

export const GyaanSetuStoryLearn: React.FC<GyaanSetuStoryLearnProps> = ({ openrouterApiKey }) => {
  const [mode, setMode] = useState<"search" | "upload">("search");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<"english" | "hindi" | "kannada">("english");
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
    }
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "text/plain") {
      return await file.text();
    } else {
      // Simple extraction for demo purposes
      return `Content extracted from ${file.name}`;
    }
  };

  const generateStory = async () => {
    setIsLoading(true);
    setStory("");
    setQuizQuestions([]);
    setQuizStarted(false);
    setQuizCompleted(false);
    
    try {
      let contentToTransform = "";
      
      if (mode === "search") {
        if (!topic.trim()) {
          throw new Error("Please enter a topic");
        }
        contentToTransform = topic;
      } else {
        if (!file) {
          throw new Error("Please upload a file");
        }
        contentToTransform = await extractTextFromFile(file);
      }

      // Language-specific instruction
      let langPrompt = "";
      if (language === "hindi") {
        langPrompt = "Write the story in Hindi using Devanagari script.";
      } else if (language === "kannada") {
        langPrompt = "Write the story in Kannada using Kannada script.";
      } else {
        langPrompt = "Write the story in English.";
      }

      // Call OpenRouter API for story generation
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openrouterApiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Sarathi Learning Platform - Gyaan Setu StoryLearn",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a creative educational storyteller that transforms complex academic topics into engaging, entertaining stories that make difficult concepts easy to understand. ${langPrompt} Make the story engaging, with memorable characters and situations that help illustrate the core concepts.`
            },
            {
              role: "user",
              content: `Transform this topic into an engaging, entertaining story that makes the concepts easy to understand: ${contentToTransform}`
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const storyData = await response.json();
      const generatedStory = storyData.choices[0].message.content;
      setStory(generatedStory);
      
      // Generate quiz questions based on the story
      await generateQuizQuestions(generatedStory, contentToTransform);
      
    } catch (error) {
      console.error("Error generating story:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate story",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuizQuestions = async (story: string, topic: string) => {
    try {
      // Call OpenRouter API for quiz generation
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openrouterApiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Sarathi Learning Platform - Gyaan Setu StoryLearn Quiz",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an educational quiz creator. Create 5 multiple-choice questions with 4 options each based on the story and topic. The questions should test understanding of the core concepts. Return the questions in JSON format with the following structure: [{\"question\": \"Question text\", \"options\": [\"Option 1\", \"Option 2\", \"Option 3\", \"Option 4\"], \"correctAnswer\": 0}] where correctAnswer is the index of the correct option."
            },
            {
              role: "user",
              content: `Create a quiz based on this story: ${story}\n\nThe topic is: ${topic}`
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const quizData = await response.json();
      const quizContent = quizData.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonMatch = quizContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const quizQuestions = JSON.parse(jsonMatch[0]);
        setQuizQuestions(quizQuestions);
      } else {
        console.error("Failed to parse quiz questions JSON");
        toast({
          title: "Warning",
          description: "Quiz questions could not be generated properly",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Warning",
        description: "Failed to generate quiz questions",
        variant: "destructive",
      });
    }
  };

  const playStory = () => {
    if (!story) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(story);
    speechSynthRef.current = utterance;
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Set voice parameters based on selected language
    let voiceLangPrefix: string;
    switch (language) {
      case "hindi":
        voiceLangPrefix = "hi";
        break;
      case "kannada":
        voiceLangPrefix = "kn";
        break;
      default: // english
        voiceLangPrefix = "en";
        break;
    }
    
    // Find an appropriate voice
    let selectedVoice = voices.find(v => v.lang.startsWith(voiceLangPrefix));
    
    // If no specific language match, fall back to English
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith("en"));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Event handlers
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onpause = () => setIsPlaying(false);
    utterance.onresume = () => setIsPlaying(true);
    utterance.onerror = () => {
      setIsPlaying(false);
      toast({
        title: "Speech Error",
        description: "There was an error playing the audio",
        variant: "destructive",
      });
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const togglePlayback = () => {
    if (!story) return;
    
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        playStory();
      }
      setIsPlaying(true);
    }
  };

  const startQuiz = () => {
    if (quizQuestions.length === 0) {
      toast({
        title: "No Quiz Available",
        description: "There are no quiz questions available for this story",
        variant: "destructive",
      });
      return;
    }
    
    setQuizStarted(true);
    setQuizCompleted(false);
    setScore(0);
    
    // Reset any previous answers
    setQuizQuestions(quizQuestions.map(q => ({...q, userAnswer: undefined})));
  };

  const handleAnswerSelection = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      userAnswer: optionIndex
    };
    setQuizQuestions(updatedQuestions);
  };

  const submitQuiz = () => {
    // Check if all questions are answered
    const allAnswered = quizQuestions.every(q => q.userAnswer !== undefined);
    
    if (!allAnswered) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate score
    const correctAnswers = quizQuestions.filter(
      q => q.userAnswer === q.correctAnswer
    ).length;
    
    setScore(correctAnswers);
    setQuizCompleted(true);
  };

  // Clean up speech synthesis when component unmounts
  React.useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
      <CardContent className="p-4">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Book className="h-5 w-5" /> StoryLearn - Learn through Stories
        </h2>
        
        <div className="space-y-4">
          {/* Topic Selection */}
          <div className="flex flex-wrap gap-4">
            <Button
              variant={mode === "search" ? "default" : "outline"}
              onClick={() => setMode("search")}
              className="flex gap-2"
            >
              <Search size={16} />
              Search Topic
            </Button>
            <Button
              variant={mode === "upload" ? "default" : "outline"}
              onClick={() => setMode("upload")}
              className="flex gap-2"
            >
              <Upload size={16} />
              Upload Content
            </Button>
          </div>
          
          {/* Language Selection */}
          <div>
            <Label htmlFor="language">Select Language</Label>
            <Select value={language} onValueChange={(val: "english" | "hindi" | "kannada") => setLanguage(val)}>
              <SelectTrigger className="w-full md:w-[180px] mt-1">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="kannada">Kannada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Search or Upload UI */}
          {mode === "search" ? (
            <div>
              <Label htmlFor="topic">Enter Topic to Learn</Label>
              <Input
                id="topic"
                placeholder="E.g., Photosynthesis, Quantum Physics, French Revolution"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Upload Text Content</Label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleFileUploadClick}
                  className="flex items-center gap-1"
                >
                  <Upload size={16} />
                  Choose File
                </Button>
                <span className="text-sm text-muted-foreground">
                  {file ? file.name : "No file chosen"}
                </span>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}
          
          {/* Generate Story Button */}
          <Button 
            onClick={generateStory} 
            disabled={isLoading || (mode === "search" ? !topic.trim() : !file)}
            className="w-full mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transforming into Story...
              </>
            ) : (
              <>
                <Book className="mr-2 h-4 w-4" />
                Generate StoryLearn
              </>
            )}
          </Button>
          
          {/* Story Display */}
          {story && !quizStarted && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Your StoryLearn:</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={togglePlayback}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="mr-1 h-4 w-4" /> Pause
                      </>
                    ) : (
                      <>
                        <Volume2 className="mr-1 h-4 w-4" /> 
                        {window.speechSynthesis.paused ? "Resume" : "Listen"}
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={startQuiz}
                  >
                    Take Quiz
                  </Button>
                </div>
              </div>
              <div className="bg-sarathi-dark p-4 rounded-md max-h-[400px] overflow-y-auto">
                <p className="whitespace-pre-wrap">{story}</p>
              </div>
            </div>
          )}
          
          {/* Quiz Section */}
          {quizStarted && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Knowledge Check Quiz</h3>
                {!quizCompleted && (
                  <Button onClick={() => setQuizStarted(false)} variant="outline" size="sm">
                    Back to Story
                  </Button>
                )}
              </div>
              
              {quizCompleted ? (
                <div className="bg-sarathi-dark p-6 rounded-md text-center">
                  <h4 className="text-xl mb-4">Quiz Results</h4>
                  <div className="text-4xl font-bold mb-4">
                    {score}/{quizQuestions.length}
                    <span className="text-base ml-2">
                      ({Math.round((score / quizQuestions.length) * 100)}%)
                    </span>
                  </div>
                  
                  <div className="space-y-4 mt-6 text-left">
                    <h5 className="font-medium">Quiz Review:</h5>
                    {quizQuestions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-sarathi-darkCard p-3 rounded-lg border border-sarathi-gray/30">
                        <p className="font-medium mb-2">{qIndex + 1}. {q.question}</p>
                        <div className="space-y-1">
                          {q.options.map((option, oIndex) => (
                            <div 
                              key={oIndex}
                              className={`flex items-center gap-2 p-2 rounded ${
                                q.userAnswer === oIndex 
                                  ? q.correctAnswer === oIndex 
                                    ? 'bg-green-900/20 border-l-4 border-green-500' 
                                    : 'bg-red-900/20 border-l-4 border-red-500'
                                  : q.correctAnswer === oIndex
                                    ? 'bg-green-900/10 border-l-4 border-green-500/50'
                                    : 'hover:bg-sarathi-gray/20'
                              }`}
                            >
                              <div className="w-5 h-5 rounded-full border border-sarathi-gray/50 flex items-center justify-center text-xs">
                                {['A', 'B', 'C', 'D'][oIndex]}
                              </div>
                              <span>{option}</span>
                              {q.correctAnswer === oIndex && (
                                <Check className="ml-auto h-4 w-4 text-green-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-center gap-2">
                    <Button onClick={() => setQuizStarted(false)} variant="outline">
                      Back to Story
                    </Button>
                    <Button onClick={startQuiz}>
                      Retry Quiz
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {quizQuestions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-sarathi-dark p-4 rounded-md">
                      <p className="font-medium mb-3">{qIndex + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((option, oIndex) => (
                          <div 
                            key={oIndex}
                            className={`flex items-center gap-2 p-3 rounded cursor-pointer ${
                              q.userAnswer === oIndex ? 'bg-primary/30 border-l-4 border-primary' : 'hover:bg-sarathi-gray/20'
                            }`}
                            onClick={() => handleAnswerSelection(qIndex, oIndex)}
                          >
                            <div className={`w-5 h-5 rounded-full ${
                              q.userAnswer === oIndex ? 'bg-primary border-primary' : 'border-sarathi-gray/50'
                            } flex items-center justify-center text-xs`}>
                              {['A', 'B', 'C', 'D'][oIndex]}
                            </div>
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={submitQuiz} className="w-full">
                    Submit Quiz
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
