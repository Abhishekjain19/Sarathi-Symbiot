import React, { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { useOfflineStorage } from "@/hooks/use-offline-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, ListTodo, BookOpen, FileText, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GyaanSetuChat, Message } from "@/components/GyaanSetuChat";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

// Types for tools
interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface Flashcard {
  front: string;
  back: string;
}

const GyaanSetuPage: React.FC = () => {
  const [messages, setMessages, isOnline] = useOfflineStorage<Message[]>("gyaansetu-messages", [], 100);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  // Predefined tool suggestions
  const toolSuggestions = [
    {
      label: "Generate Quiz",
      description: "Create questions on any topic",
      icon: ListTodo,
      prompt: "Create a 5-question quiz on "
    },
    {
      label: "Flashcards",
      description: "Make revision cards",
      icon: FileText,
      prompt: "Make flashcards for "
    },
    {
      label: "Explain Simply",
      description: "Simplify complex topics",
      icon: BookOpen,
      prompt: "Explain in simple language: "
    },
    {
      label: "Study Plan",
      description: "Get a study schedule",
      icon: CalendarDays,
      prompt: "Create a study plan for "
    }
  ];

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now()
    };
    
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      if (!isOnline) {
        // Handle offline mode
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const offlineMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm currently in offline mode. Your question has been saved and will be answered when you're back online. In the meantime, you can review your past conversations.",
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, offlineMessage]);
        toast({
          title: "Offline Mode",
          description: "GyaanSetu is working offline. Connection required for new responses.",
        });
      } else {
        // Online mode - simulate API call for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Example response handler - in real implementation, this would be the LLM API response
        let assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: generateDemoResponse(input),
          timestamp: Date.now()
        };
        
        // Check for tool usage in the query
        if (input.toLowerCase().includes("quiz") || input.toLowerCase().includes("question")) {
          assistantMessage.toolResult = {
            type: "quiz",
            content: generateDemoQuiz(input)
          };
        } else if (input.toLowerCase().includes("flashcard")) {
          assistantMessage.toolResult = {
            type: "flashcard",
            content: generateDemoFlashcards(input)
          };
        }
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Demo response generators - replace with actual API calls in production
  const generateDemoResponse = (query: string): string => {
    if (query.toLowerCase().includes("quiz") || query.toLowerCase().includes("question")) {
      return "Here's a quiz for you to practice:";
    } else if (query.toLowerCase().includes("flashcard")) {
      return "I've created some flashcards to help you study:";
    } else if (query.toLowerCase().includes("explain")) {
      return "Let me explain this concept in simpler terms: The key idea here is that everything in nature works in balanced pairs. When you push against something, that something pushes back against you with equal force. It's like sitting on a chair - your weight pushes down on the chair, and the chair pushes up on you with the same amount of force. Without this balance, you'd either sink through the chair or float up into the air!";
    } else if (query.toLowerCase().includes("summarize") || query.toLowerCase().includes("summary")) {
      return "Here's a summary of the key points:\n\n• Plants make their food through photosynthesis\n• They use sunlight, water, and carbon dioxide\n• Chlorophyll is the green pigment that captures sunlight\n• Oxygen is released as a byproduct\n• The process happens in the chloroplasts\n• Glucose is the main product created";
    } else if (query.toLowerCase().includes("study plan") || query.toLowerCase().includes("schedule")) {
      return "Here's a simple study plan for you:\n\n**Day 1**: Review chapter 1-2, complete 10 practice problems\n**Day 2**: Study chapter 3, create flashcards for key concepts\n**Day 3**: Review all formulas, work through example problems\n**Day 4**: Take practice test, identify weak areas\n**Day 5**: Focus on weak areas, final review of all material";
    }
    return "I'm GyaanSetu, your AI study assistant. I can help explain concepts, create quizzes, make flashcards, summarize information, or suggest study plans for any academic subject you're working on. What would you like help with today?";
  };
  
  const generateDemoQuiz = (query: string): QuizQuestion[] => {
    return [
      {
        question: "What is the capital of India?",
        options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
        answer: 1
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Jupiter", "Mars", "Saturn"],
        answer: 2
      },
      {
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "O2", "N2"],
        answer: 0
      }
    ];
  };
  
  const generateDemoFlashcards = (query: string): Flashcard[] => {
    return [
      {
        front: "Photosynthesis",
        back: "Process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water"
      },
      {
        front: "Mitochondria",
        back: "Organelle that generates energy for the cell in the form of ATP"
      },
      {
        front: "Osmosis",
        back: "Process by which molecules of a solvent pass through a semipermeable membrane from a less concentrated solution into a more concentrated one"
      }
    ];
  };

  return (
    <div className="min-h-screen bg-sarathi-dark text-white flex flex-col">
      <NavBar />
      
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4">
        <div className="py-4 border-b border-sarathi-gray/30">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center">
              ज्ञानसेतु (GyaanSetu)
              <span className="ml-2 text-xs bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                AI Assistant
              </span>
            </h1>
            
            {!isOnline && (
              <span className="offline-badge">Offline Mode</span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Ask any study-related question or use the tools below
          </p>
        </div>
        
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center h-full text-center px-4 py-12">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <MessageCircle size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Welcome to GyaanSetu!</h2>
            <p className="text-muted-foreground mb-6">
              Your AI study companion. Ask any academic question or try one of the tools below.
            </p>
            
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {toolSuggestions.map((tool, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center p-4 rounded-lg border border-sarathi-gray/30 bg-sarathi-darkCard hover:bg-sarathi-gray/20 transition-colors"
                  onClick={() => setInput(tool.prompt)}
                >
                  <div className="bg-primary/10 p-2 rounded-full mb-2">
                    <tool.icon size={18} className="text-primary" />
                  </div>
                  <span className="font-medium text-sm">{tool.label}</span>
                  <span className="text-xs text-muted-foreground mt-1">{tool.description}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <GyaanSetuChat 
            messages={messages}
            isLoading={isLoading}
          />
        )}
        
        <div className="py-4 border-t border-sarathi-gray/30">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask any study question..."
              className="bg-sarathi-gray/30 border-sarathi-gray/50 focus-visible:ring-secondary"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            >
              <Send size={18} />
            </Button>
          </form>
          
          {/* Quick action buttons */}
          <div className="flex gap-2 overflow-x-auto py-3">
            {toolSuggestions.map((tool) => (
              <Button
                key={tool.label}
                variant="outline"
                size="sm"
                className="flex gap-1 whitespace-nowrap text-xs py-1 h-auto"
                onClick={() => setInput(tool.prompt)}
                disabled={isLoading}
              >
                <tool.icon size={12} />
                {tool.label}
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GyaanSetuPage;
