import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Loader2, Download, Play, Pause, Upload, Volume2 } from "lucide-react";

interface VoiceSummaryProps {
  openrouterApiKey: string;
}

type Voice = "male" | "female";
type Language = "english" | "hindi" | "kannada";

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
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeechPausedRef = useRef<boolean>(false);

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

      // Adjust system prompt based on language
      let systemPrompt = "You are an educational assistant that provides ";
      
      if (language === "english") {
        systemPrompt += "concise, informative summaries in English. ";
      } else if (language === "hindi") {
        systemPrompt += "concise, informative summaries in Hindi. Please write your response in Hindi using Devanagari script. ";
      } else if (language === "kannada") {
        systemPrompt += "concise, informative summaries in Kannada. Please write your response in Kannada script. ";
      }
      
      systemPrompt += activeTab === "topic" 
        ? "Keep summaries focused, factual, and suitable for students."
        : "Extract key points and important information, keeping the summary focused and factual.";
      
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
              content: systemPrompt
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
      
      // Generate speech using browser's TTS
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
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Reset state
    isSpeechPausedRef.current = false;
    setIsPlaying(false);
    
    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthRef.current = utterance;
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    console.log("Available voices:", voices.map(v => ({ name: v.name, lang: v.lang })));
    
    // Set voice parameters based on selected language and gender
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
    
    // Find an appropriate voice with improved matching
    let selectedVoice = null;
    
    // First try to find an exact match for language and gender
    // Enhanced male voice detection with broader keywords
    selectedVoice = voices.find(v => 
      v.lang.startsWith(voiceLangPrefix) && 
      ((voice === "female" && /female|woman|girl|f\s/i.test(v.name.toLowerCase())) || 
       (voice === "male" && /male|man|guy|boy|m\s/i.test(v.name.toLowerCase())))
    );
    
    // If no specific gender match, try just language match
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith(voiceLangPrefix));
    }
    
    // If still no match, fall back to any English voice with the right gender
    if (!selectedVoice && language !== "english") {
      selectedVoice = voices.find(v => 
        v.lang.startsWith("en") && 
        ((voice === "female" && /female|woman|girl|f\s/i.test(v.name.toLowerCase())) || 
         (voice === "male" && /male|man|guy|boy|m\s/i.test(v.name.toLowerCase())))
      );
    }
    
    // Last resort - any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith("en"));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log("Selected voice:", selectedVoice.name, selectedVoice.lang);
    } else {
      console.warn("No suitable voice found, using default voice");
    }
    
    // Further enhanced voice characteristics for more distinct male/female voices
    if (voice === "female") {
      utterance.pitch = 1.2;  // Slightly higher for female
      utterance.rate = 1.0;   // Normal rate
    } else {
      // Even more significantly lowered pitch for male voice
      utterance.pitch = 0.3;  // Much lower for stronger male voice distinction
      utterance.rate = 0.9;   // Slightly slower for more distinct male voice
    }
    
    // Create a blob for download capability
    const blobURL = URL.createObjectURL(
      new Blob([text], { type: 'text/plain' })
    );
    setAudioUrl(blobURL);
    
    // Event handlers with improved state tracking
    utterance.onstart = () => {
      setIsPlaying(true);
      console.log("Speech started");
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      isSpeechPausedRef.current = false;
      console.log("Speech ended");
    };
    
    utterance.onpause = () => {
      setIsPlaying(false);
      isSpeechPausedRef.current = true;
      console.log("Speech paused");
    };
    
    utterance.onresume = () => {
      setIsPlaying(true);
      isSpeechPausedRef.current = false;
      console.log("Speech resumed");
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsPlaying(false);
      isSpeechPausedRef.current = false;
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

  // Completely redesigned togglePlayback function to fix pause/resume issues
  const togglePlayback = () => {
    if (!summary) return;
    
    // Log current state for debugging
    console.log("Current state:", { 
      isPlaying, 
      isPaused: isSpeechPausedRef.current,
      synthSpeaking: window.speechSynthesis.speaking,
      synthPaused: window.speechSynthesis.paused
    });
    
    if (isPlaying) {
      // Currently playing, so pause
      window.speechSynthesis.pause();
      isSpeechPausedRef.current = true;
      setIsPlaying(false);
      console.log("Pausing speech");
    } else {
      // Not playing - either need to resume or start new
      if (window.speechSynthesis.paused) {
        // Resume paused speech
        window.speechSynthesis.resume();
        isSpeechPausedRef.current = false;
        setIsPlaying(true);
        console.log("Resuming speech");
      } else {
        // Nothing is playing or paused, start new speech
        console.log("Starting new speech");
        generateSpeech(summary);
      }
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

  // Add a cleanup effect to ensure speech synthesis is properly canceled when component unmounts
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
            <Select value={language} onValueChange={(val: Language) => setLanguage(val)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="kannada">Kannada</SelectItem>
              </SelectContent>
            </Select>
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
                    <Play className="mr-1 h-4 w-4" /> 
                    {window.speechSynthesis.paused ? "Resume" : "Play"}
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
            
            <audio ref={audioRef} src={audioUrl || ''} className="hidden" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
