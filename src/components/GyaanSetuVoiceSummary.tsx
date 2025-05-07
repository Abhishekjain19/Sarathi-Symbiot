
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Download, Play, Pause, Upload, Volume2 } from "lucide-react";

interface VoiceSummaryProps {
  openrouterApiKey: string;
}

type Voice = "male" | "female";
type Language = "english" | "hindi";

export const GyaanSetuVoiceSummary: React.FC<VoiceSummaryProps> = ({ openrouterApiKey }) => {
  const [activeTab, setActiveTab] = useState<string>("topic");
  const [topic, setTopic] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voice, setVoice] = useState<Voice>("female");
  const [language, setLanguage] = useState<Language>("english");
  const [file, setFile] = useState<File | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = [
        "text/plain", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/pdf"
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt, .docx, or .pdf file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      // Show filename in the UI
      if (fileInputRef.current) {
        fileInputRef.current.value = selectedFile.name;
      }
    }
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // This is a simplified version. In a production app, you'd want to use proper libraries
    // to extract text from different file types, especially PDFs and DOCXs
    if (file.type === "text/plain") {
      return await file.text();
    } else {
      // For demo purposes, we'll just return a placeholder
      // In a real implementation, you'd use specific libraries for DOCX and PDF parsing
      toast({
        title: "File Processing",
        description: "Processing file content. In a production environment, proper document parsing would occur.",
      });
      return `Content extracted from ${file.name}`;
    }
  };

  const generateSummary = async () => {
    setIsLoading(true);
    setSummary("");
    setAudioUrl(null);
    
    try {
      let contentToSummarize = "";
      
      if (activeTab === "topic") {
        if (!topic.trim()) {
          throw new Error("Please enter a topic");
        }
        contentToSummarize = `Provide a concise educational summary about: ${topic}`;
      } else {
        if (file) {
          contentToSummarize = await extractTextFromFile(file);
        } else if (text.trim()) {
          contentToSummarize = text;
        } else {
          throw new Error("Please enter text or upload a file");
        }
      }
      
      // Call OpenRouter API for summary
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openrouterApiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Sarathi Learning Platform - Gyaan Setu",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: activeTab === "topic" 
                ? "You are an educational assistant that provides concise, informative summaries about academic topics. Keep summaries focused, factual, and suitable for students." 
                : "You are an educational assistant that summarizes long texts into concise, informative summaries. Extract key points and important information, keeping the summary focused and factual."
            },
            {
              role: "user",
              content: contentToSummarize
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const generatedSummary = data.choices[0].message.content;
      setSummary(generatedSummary);
      
      // For this version, we'll use browser's built-in TTS
      // In a production app, you'd connect to ElevenLabs or another TTS service
      generateSpeech(generatedSummary);
      
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSpeech = (text: string) => {
    // Using browser's built-in TTS for this implementation
    // In a production app, you'd call a TTS API like ElevenLabs here
    
    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on language and gender preference
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    if (language === "english") {
      selectedVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        ((voice === "female" && v.name.includes('Female')) || 
         (voice === "male" && v.name.includes('Male')))
      );
    } else if (language === "hindi") {
      selectedVoice = voices.find(v => 
        v.lang.startsWith('hi') && 
        ((voice === "female" && v.name.includes('Female')) || 
         (voice === "male" && v.name.includes('Male')))
      );
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Create a blob for download capability
    const blobURL = URL.createObjectURL(
      new Blob([text], { type: 'text/plain' })
    );
    setAudioUrl(blobURL);
    
    // Play the speech
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    
    utterance.onend = () => {
      setIsPlaying(false);
    };
  };

  const togglePlayback = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else if (summary) {
      generateSpeech(summary);
    }
  };

  const handleDownload = () => {
    if (!summary) return;
    
    // Create a download link for the text
    const element = document.createElement("a");
    const file = new Blob([summary], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `summary-${activeTab === "topic" ? topic : "text"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
      <CardContent className="p-4">
        <h2 className="text-xl font-bold mb-4">Voice Summary</h2>
        
        <Tabs defaultValue="topic" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="topic">Topic-Based Summary</TabsTrigger>
            <TabsTrigger value="text">Text or File Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="topic" className="space-y-4">
            <div>
              <Label htmlFor="topic">Enter Topic</Label>
              <Input
                id="topic"
                placeholder="E.g., Photosynthesis, French Revolution, Quantum Physics"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4">
            <div>
              <Label htmlFor="text">Enter Text to Summarize</Label>
              <Textarea
                id="text"
                placeholder="Paste your paragraph or long text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 h-32"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label>Or Upload a File</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFileUploadClick}
                className="flex items-center gap-1"
              >
                <Upload size={16} />
                Choose File
              </Button>
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".txt,.docx,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-sm text-muted-foreground">
                {file ? file.name : "No file chosen"}
              </span>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-wrap gap-4 my-4">
          <div>
            <Label htmlFor="voice-type">Voice</Label>
            <div className="flex mt-1">
              <Button
                type="button"
                variant={voice === "male" ? "default" : "outline"}
                size="sm"
                onClick={() => setVoice("male")}
                className="rounded-r-none"
              >
                Male
              </Button>
              <Button
                type="button"
                variant={voice === "female" ? "default" : "outline"}
                size="sm"
                onClick={() => setVoice("female")}
                className="rounded-l-none"
              >
                Female
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="language">Language</Label>
            <div className="flex mt-1">
              <Button
                type="button"
                variant={language === "english" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("english")}
                className="rounded-r-none"
              >
                English
              </Button>
              <Button
                type="button"
                variant={language === "hindi" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("hindi")}
                className="rounded-l-none"
              >
                Hindi
              </Button>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={generateSummary} 
          disabled={isLoading || (activeTab === "topic" ? !topic.trim() : (!text.trim() && !file))}
          className="w-full mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              Summarize & Listen
            </>
          )}
        </Button>
        
        {summary && (
          <div className="mt-6 space-y-4">
            <div className="bg-sarathi-dark p-4 rounded-md">
              <h3 className="font-medium mb-2">Summary:</h3>
              <p className="whitespace-pre-wrap">{summary}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
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
                    <Play className="mr-1 h-4 w-4" /> Play
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
              >
                <Download className="mr-1 h-4 w-4" /> Download Summary
              </Button>
            </div>
            
            {/* Hidden audio element for browser compatibility */}
            <audio ref={audioRef} src={audioUrl || ''} className="hidden" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
