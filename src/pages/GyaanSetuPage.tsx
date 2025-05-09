import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, MessageCircle, Volume2, Book, Trophy } from "lucide-react";
import { GyaanSetuChat, Message } from "@/components/GyaanSetuChat";
import { GyaanSetuVoiceSummary } from "@/components/GyaanSetuVoiceSummary";
import { GyaanSetuStoryLearn } from "@/components/GyaanSetuStoryLearn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

const OPENROUTE_API_KEY = "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";

const GyaanSetuPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: "assistant",
      content: "Hello! I'm Gyaan Setu, your AI learning assistant. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to the chat
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call OpenRouteAI API
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTE_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Sarathi Learning Platform - Gyaan Setu",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are Gyaan Setu, an educational AI assistant for the Sarathi learning platform. You help students with their educational queries, explain concepts, provide examples, and offer learning resources."
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: input
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response to the chat
      const aiResponse: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.choices[0].message.content,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error calling OpenRouteAI:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again later.",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Improved voice initialization
  useEffect(() => {
    if (!profile) {
      navigate("/auth");
    }
  }, [profile, navigate]);

  // Enhanced speech synthesis voice loading with robust error handling
  useEffect(() => {
    const initVoices = () => {
      try {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          console.log("Initializing speech synthesis...");
          
          // Force load voices
          let voices = window.speechSynthesis.getVoices();
          
          // If voices are already available, prepare the speech engine
          if (voices.length > 0) {
            console.log(`Voices already loaded: ${voices.length}`);
            
            // Create a silent test utterance with zero volume to initialize the speech engine
            try {
              const testUtterance = new SpeechSynthesisUtterance(" ");
              testUtterance.volume = 0;
              testUtterance.onend = () => console.log("Test utterance completed");
              testUtterance.onerror = (e) => console.error("Test utterance error:", e);
              
              // Speaking and immediately canceling helps initialize the engine
              window.speechSynthesis.speak(testUtterance);
              window.speechSynthesis.cancel();
              
              console.log("Speech engine initialized");
            } catch (err) {
              console.error("Error in test utterance:", err);
            }
            
            return;
          }
          
          // Add voice changed event listener if voices aren't loaded yet
          window.speechSynthesis.onvoiceschanged = () => {
            try {
              voices = window.speechSynthesis.getVoices();
              console.log(`Voices loaded: ${voices.length}`);
              console.log("Available voices:", voices.map(v => ({
                name: v.name,
                lang: v.lang,
                default: v.default ? "Yes" : "No"
              })));
              
              // Initialize the engine with a test utterance
              const testUtterance = new SpeechSynthesisUtterance(" ");
              testUtterance.volume = 0;
              window.speechSynthesis.speak(testUtterance);
              window.speechSynthesis.cancel();
            } catch (err) {
              console.error("Error in onvoiceschanged:", err);
            }
          };
          
          // Force voices to load with multiple attempts
          try {
            // First attempt with empty utterance
            const forceUtterance = new SpeechSynthesisUtterance(" ");
            forceUtterance.volume = 0;
            window.speechSynthesis.speak(forceUtterance);
            window.speechSynthesis.cancel();
            
            // Second attempt with a different approach
            setTimeout(() => {
              if (window.speechSynthesis.getVoices().length === 0) {
                console.log("Trying second voice loading method...");
                window.speechSynthesis.cancel();
                const forceUtterance2 = new SpeechSynthesisUtterance("test");
                forceUtterance2.volume = 0;
                forceUtterance2.rate = 0;
                window.speechSynthesis.speak(forceUtterance2);
                window.speechSynthesis.cancel();
              }
            }, 500);
          } catch (err) {
            console.error("Error forcing voice load:", err);
          }
        }
      } catch (err) {
        console.error("Critical error initializing speech:", err);
      }
    };
    
    // Initialize voices
    initVoices();
    
    // Re-initialize on tab activation to handle browser quirks
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab became visible, re-initializing voices");
        initVoices();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle potential errors with speechSynthesis
    const checkSynthesisState = () => {
      try {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          // If speech is paused for too long, it might get stuck
          if (window.speechSynthesis.paused && !document.hidden) {
            console.log("Detected potentially stuck paused state, resetting...");
            window.speechSynthesis.cancel();
          }
        }
      } catch (err) {
        console.error("Error checking synthesis state:", err);
      }
    };
    
    // Periodically check if speech synthesis is in a stuck state
    const intervalId = setInterval(checkSynthesisState, 10000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
      
      // Clean up any ongoing speech when component unmounts
      if (typeof window !== "undefined" && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (err) {
          console.error("Error canceling speech on unmount:", err);
        }
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Gyaan Setu - AI Learning Assistant</h1>

        {/* Featured Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg mb-6 shadow-lg animate-fade-in">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 md:mr-4">
              <h2 className="text-xl font-bold">Try Gyan Battles!</h2>
              <p className="text-white/90">Challenge yourself with fun AI-powered educational quizzes</p>
            </div>
            <Button 
              onClick={() => navigate('/gyan-battles')} 
              className="bg-white text-blue-700 hover:bg-blue-50 flex items-center gap-2"
            >
              <Trophy size={18} />
              Play Now
            </Button>
          </div>
        </div>

        <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageCircle size={16} />
              Chat Assistant
            </TabsTrigger>
            <TabsTrigger value="voice-summary" className="flex items-center gap-1">
              <Volume2 size={16} />
              Voice Summary
            </TabsTrigger>
            <TabsTrigger value="story-learn" className="flex items-center gap-1">
              <Book size={16} />
              StoryLearn
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <Card className="bg-sarathi-darkCard border-sarathi-gray/30 h-[70vh] flex flex-col">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex-1 overflow-hidden">
                  <GyaanSetuChat messages={messages} isLoading={isLoading} />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Ask anything about your studies..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendMessage();
                      }
                    }}
                  />
                  <Button onClick={sendMessage} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send size={16} className="mr-2" />}
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="voice-summary">
            <div className="h-[70vh] overflow-y-auto pr-2">
              <GyaanSetuVoiceSummary openrouterApiKey={OPENROUTE_API_KEY} />
            </div>
          </TabsContent>
          
          <TabsContent value="story-learn">
            <div className="h-[70vh] overflow-y-auto pr-2">
              <GyaanSetuStoryLearn openrouterApiKey={OPENROUTE_API_KEY} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GyaanSetuPage;
