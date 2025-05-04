import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";

const GyaanSetuPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [messages, setMessages] = useState([
    {
      text: "Hello! How can I help you today?",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = {
        text: `This is a simulated response to: ${input}`,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    if (!profile) {
      navigate("/auth");
    }
  }, [profile, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Gyaan Setu - AI Assistant</h1>

        <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
          <CardContent className="p-4">
            <div
              className="space-y-4 max-h-[500px] overflow-y-auto pr-2"
              ref={chatContainerRef}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex w-full rounded-lg p-3 text-sm ${
                    message.isUser
                      ? "bg-primary text-primary-foreground justify-end"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="text-left">{message.text}</p>
                </div>
              ))}
              {isLoading && (
                <div className="flex w-full rounded-lg p-3 text-sm bg-secondary text-secondary-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send size={16} />}
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
