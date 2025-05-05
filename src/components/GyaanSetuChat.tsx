
import React, { useState, useRef, useEffect } from "react";
import { Loader } from "lucide-react";
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";

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
}

export const GyaanSetuChat: React.FC<GyaanSetuChatProps> = ({ 
  messages, 
  isLoading 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    <div className="flex-1 overflow-y-auto py-4 space-y-6">
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
  );
};
