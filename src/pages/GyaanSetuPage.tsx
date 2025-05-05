
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { GyaanSetuChat, Message } from "@/components/GyaanSetuChat";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";

const OPENROUTE_API_KEY = "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";

const GyaanSetuPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
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

  useEffect(() => {
    if (!profile) {
      navigate("/auth");
    }
  }, [profile, navigate]);

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Gyaan Setu - AI Learning Assistant</h1>

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
      </main>
    </div>
  );
};

export default GyaanSetuPage;
