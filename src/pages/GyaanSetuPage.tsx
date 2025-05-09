
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GyaanSetuChat } from "@/components/GyaanSetuChat";
import { GyaanSetuStoryLearn } from "@/components/GyaanSetuStoryLearn";
import { GyaanSetuVoiceSummary } from "@/components/GyaanSetuVoiceSummary";
import { useToast } from "@/components/ui/use-toast";

// Calculate difficulty based on grade
const calculateDifficulty = (grade: string): string => {
  // Convert grade formats like "4th" to number 4
  const gradeNumber = parseInt(grade.replace(/[^0-9]/g, ''));
  
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

// Language model mapping based on difficulty
const difficultyModelMapping = {
  elementary: "gpt-3.5-turbo",
  intermediate: "gpt-3.5-turbo-16k",
  advanced: "gpt-4-turbo",
  expert: "gpt-4-turbo"
};

// Default prompt modifiers based on difficulty
const difficultyPromptModifiers = {
  elementary: "Use simple language and short sentences. Explain concepts like you would to a young child.",
  intermediate: "Use clear examples and visual analogies. Avoid complex terminology.",
  advanced: "Include more technical terms and detailed explanations, but still with examples.",
  expert: "You can use specialized terminology and go into depth on concepts."
};

const API_KEY = "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";
const API_HOST = "https://openrouter.ai/api/v1";

const GyaanSetuPage = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [difficulty, setDifficulty] = useState<string>("intermediate");
  const [model, setModel] = useState<string>(difficultyModelMapping.intermediate);
  const [promptModifier, setPromptModifier] = useState<string>(difficultyPromptModifiers.intermediate);
  
  const { isLoading, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const pausedRef = useRef<boolean>(false);
  const stuckTimeoutRef = useRef<number | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    const synth = window.speechSynthesis;
    console.info("Initializing speech synthesis...");
    
    // Handle existing voices
    const existingVoices = synth.getVoices();
    if (existingVoices.length > 0) {
      console.info(`Voices already loaded: ${existingVoices.length}`);
      setVoices(existingVoices);
    }
    
    // Handle voice list change
    const handleVoicesChanged = () => {
      const availableVoices = synth.getVoices();
      console.info(`Voices loaded: ${availableVoices.length}`);
      setVoices(availableVoices);
    };
    
    synth.addEventListener("voiceschanged", handleVoicesChanged);
    
    // Test speech synthesis
    const testUtterance = new SpeechSynthesisUtterance("Test");
    testUtterance.volume = 0; // Silent test
    testUtterance.onend = () => {
      console.info("Speech engine initialized");
    };
    testUtterance.onerror = (event) => {
      console.error("Test utterance error:", event);
    };
    synth.speak(testUtterance);
    
    return () => {
      synth.cancel();
      synth.removeEventListener("voiceschanged", handleVoicesChanged);
      
      // Clear any stuck timeout
      if (stuckTimeoutRef.current) {
        clearTimeout(stuckTimeoutRef.current);
      }
    };
  }, []);

  // Monitor for stuck paused states
  useEffect(() => {
    if (isPaused) {
      pausedRef.current = true;
      
      // Set a timeout to check if we're stuck in paused state
      stuckTimeoutRef.current = window.setTimeout(() => {
        if (pausedRef.current) {
          console.info("Detected potentially stuck paused state, resetting...");
          setIsSpeaking(false);
          setIsPaused(false);
          pausedRef.current = false;
          
          if (currentUtterance) {
            window.speechSynthesis.cancel();
            setCurrentUtterance(null);
          }
        }
      }, 10000); // Check after 10 seconds
      
      return () => {
        if (stuckTimeoutRef.current) {
          clearTimeout(stuckTimeoutRef.current);
          stuckTimeoutRef.current = null;
        }
      };
    } else {
      pausedRef.current = false;
    }
  }, [isPaused, currentUtterance]);

  // Set difficulty based on user profile grade
  useEffect(() => {
    if (profile?.grade) {
      const calculatedDifficulty = calculateDifficulty(profile.grade);
      setDifficulty(calculatedDifficulty);
      setModel(difficultyModelMapping[calculatedDifficulty as keyof typeof difficultyModelMapping]);
      setPromptModifier(difficultyPromptModifiers[calculatedDifficulty as keyof typeof difficultyPromptModifiers]);
    }
  }, [profile]);

  // Handle API errors and provide fallbacks
  const handleAPIError = (error: any) => {
    console.error("API Error:", error);
    
    toast({
      title: "Connection Issues",
      description: "Using offline response mode due to API limitations",
      variant: "destructive", // Changed from "warning" to "destructive"
      duration: 4000,
    });
    
    return {
      success: false,
      error: error.message || "Unknown error occurred"
    };
  };

  // Only show loader when authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-sarathi-dark flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isLoading && !profile) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      <main className="container mx-auto px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold mb-2">GyaanSetu Learning Assistant</h1>
        <p className="text-gray-400 mb-6">
          Your AI tutor helps you learn anything through conversation, stories, and voice summaries.
          <span className="ml-2 text-primary">
            Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} (Grade {profile?.grade || "Unknown"})
          </span>
        </p>
        
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Chat Tutor</TabsTrigger>
            <TabsTrigger value="story">Story Learning</TabsTrigger>
            <TabsTrigger value="voice">Voice Summaries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <GyaanSetuChat 
              apiKey={API_KEY} 
              apiHost={API_HOST} 
              model={model}
              promptModifier={promptModifier}
              difficulty={difficulty}
              handleAPIError={handleAPIError}
            />
          </TabsContent>
          
          <TabsContent value="story">
            <GyaanSetuStoryLearn 
              apiKey={API_KEY} 
              apiHost={API_HOST} 
              model={model}
              promptModifier={promptModifier}
              difficulty={difficulty}
              handleAPIError={handleAPIError}
            />
          </TabsContent>
          
          <TabsContent value="voice">
            <GyaanSetuVoiceSummary 
              apiKey={API_KEY} 
              apiHost={API_HOST}
              voices={voices}
              isSpeaking={isSpeaking}
              setIsSpeaking={setIsSpeaking}
              isPaused={isPaused}
              setIsPaused={setIsPaused}
              currentUtterance={currentUtterance}
              setCurrentUtterance={setCurrentUtterance}
              model={model}
              promptModifier={promptModifier}
              difficulty={difficulty}
              handleAPIError={handleAPIError}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GyaanSetuPage;
