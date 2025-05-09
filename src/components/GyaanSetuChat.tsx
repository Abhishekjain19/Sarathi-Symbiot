import React, { useState, useRef, useEffect } from "react";
import { Loader } from "lucide-react";
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types for messages and tools
export type MessageRole = "user" | "assistant";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface Flashcard {
  front: string;
  back: string;
}

interface ToolResult {
  type: "quiz" | "flashcard" | "explanation" | "summary" | "studyPlan";
  content: string | QuizQuestion[] | Flashcard[];
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  toolResult?: ToolResult;
  timestamp: number;
}

interface GyaanSetuChatProps {
  messages: Message[];
  isLoading: boolean;
  onAddMessage?: (msg: Message) => void;
  onSendMessage?: (text: string) => void;
}

export const GyaanSetuChat: React.FC<GyaanSetuChatProps> = ({ 
  messages, 
  isLoading,
  onAddMessage,
  onSendMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchWord, setSearchWord] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDictionarySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchWord.trim() || !onAddMessage) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(searchWord)}`);
      const data = await res.json();
      let definition = "No definition found.";
      if (Array.isArray(data) && data[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
        definition = data[0].meanings[0].definitions[0].definition;
      }
      onAddMessage({
        id: Date.now().toString() + Math.random(),
        role: "assistant",
        content: `**${searchWord}**: ${definition}`,
        timestamp: Date.now(),
      });
    } catch (err) {
      onAddMessage({
        id: Date.now().toString() + Math.random(),
        role: "assistant",
        content: `Could not fetch definition for "${searchWord}".`,
        timestamp: Date.now(),
      });
    } finally {
      setSearchLoading(false);
      setSearchWord("");
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !onSendMessage || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  // Render quiz component
  const renderQuiz = (quiz: QuizQuestion[]) => {
    return (
      <div className="flex flex-col gap-4 mt-2">
        {quiz.map((q, qIndex) => (
          <div key={qIndex} className="bg-sarathi-darkCard p-3 rounded-lg border border-sarathi-gray/30">
            <p className="font-medium mb-2">{qIndex + 1}. {q.question}</p>
            <div className="space-y-1">
              {q.options.map((option, oIndex) => (
                <div 
                  key={oIndex}
                  className="flex items-center gap-2 p-2 rounded hover:bg-sarathi-gray/20 cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded-full border ${oIndex === q.answer ? 'bg-secondary border-secondary' : 'border-sarathi-gray/50'} flex items-center justify-center text-xs`}>
                    {['A', 'B', 'C', 'D'][oIndex]}
                  </div>
                  <span>{option}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render flashcards component
  const renderFlashcards = (flashcards: Flashcard[]) => {
    return (
      <div className="grid grid-cols-1 gap-4 mt-2">
        {flashcards.map((card, index) => (
          <div key={index} className="bg-gradient-to-br from-primary/10 to-secondary/20 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-sarathi-gray/30">
              <p className="font-medium">{card.front}</p>
            </div>
            <div className="p-4 bg-sarathi-darkCard">
              <p>{card.back}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      <form onSubmit={handleDictionarySearch} className="flex gap-2 mb-2">
        <input
          type="text"
          className="flex-1 rounded px-3 py-2 bg-sarathi-darkCard border border-sarathi-gray/30 text-white"
          placeholder="Search dictionary..."
          value={searchWord}
          onChange={e => setSearchWord(e.target.value)}
          disabled={searchLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
          disabled={searchLoading || !searchWord.trim()}
        >
          {searchLoading ? "Searching..." : "Search"}
        </button>
      </form>
      <ScrollArea className="h-full w-full flex-1">
        <div className="flex-1 py-4 space-y-6 pr-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] ${
                  message.role === 'user' 
                    ? 'bg-primary/20 rounded-t-2xl rounded-l-2xl' 
                    : 'bg-sarathi-darkCard rounded-t-2xl rounded-r-2xl'
                } p-4`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium">
                    {message.role === 'user' ? 'You' : 'GyaanSetu'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <p className="whitespace-pre-wrap">{message.content}</p>
                
                {message.toolResult && (
                  <div className="mt-3">
                    {message.toolResult.type === 'quiz' && renderQuiz(message.toolResult.content as QuizQuestion[])}
                    {message.toolResult.type === 'flashcard' && renderFlashcards(message.toolResult.content as Flashcard[])}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-[85%] bg-sarathi-darkCard border-sarathi-gray/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <Loader size={16} className="animate-spin" />
                  <p>GyaanSetu is thinking...</p>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 rounded px-3 py-2 bg-sarathi-darkCard border border-sarathi-gray/30 text-white"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};
