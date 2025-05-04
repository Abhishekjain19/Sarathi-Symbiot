import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Download, Plus, Minus, MessageCircle, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";

// Mock lecture data
const lectureData = {
  id: "1",
  title: "Introduction to Physics: Newton's Laws of Motion",
  professor: "Dr. Sharma",
  institution: "IIT Delhi (Retd.)",
  videoUrl: "https://placehold.co/600x400/1a237e/ffffff?text=Video+Player",
  description: "This lecture covers the fundamental principles of Newton's three laws of motion, explaining how they form the foundation of classical mechanics and their applications in everyday life.",
  duration: "45 minutes",
  notes: "In this lecture we cover:\n• First law (Law of Inertia)\n• Second law (F=ma)\n• Third law (Action and reaction)\n• Practical applications\n• Common misconceptions",
  relatedMaterials: [
    { id: 1, title: "Newton's Laws Problem Set", type: "PDF" },
    { id: 2, title: "Interactive Forces Simulator", type: "Web" },
    { id: 3, title: "History of Classical Mechanics", type: "Article" }
  ],
  comments: [
    { id: 1, user: "Rahul S.", comment: "This really helped me understand the concept of inertia better. Thank you!", time: "2 days ago" },
    { id: 2, user: "Priya K.", comment: "Could you please explain the third law with more examples in the next lecture?", time: "1 day ago" }
  ]
};

const LecturePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentProgress, setCurrentProgress] = useState(30); // Mock progress

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate download
    setTimeout(() => {
      setIsDownloading(false);
      setIsDownloaded(true);
    }, 2000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container mx-auto px-0 md:px-4 pb-20">
        {/* Video Player Section */}
        <div className="relative aspect-video bg-black">
          <img 
            src={lectureData.videoUrl} 
            alt="Video player" 
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 rounded-full p-0 bg-white/20"
                >
                  <Minus size={16} />
                </Button>
                <span className="text-sm">{playbackSpeed}x</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 rounded-full p-0 bg-white/20"
                >
                  <Plus size={16} />
                </Button>
              </div>
              {!isDownloaded ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3 bg-white/20"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  <Download size={16} className="mr-1" /> 
                  {isDownloading ? "Downloading..." : "Download"}
                </Button>
              ) : (
                <span className="text-xs bg-green-600/30 text-green-500 px-2 py-1 rounded">
                  Available Offline
                </span>
              )}
            </div>
            <Progress value={currentProgress} className="h-1" />
          </div>
        </div>
        
        {/* Lecture Info */}
        <div className="px-4 py-4">
          <button 
            onClick={handleBack}
            className="flex items-center text-sm text-muted-foreground mb-2"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          
          <h1 className="text-xl font-bold">{lectureData.title}</h1>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-sm">{lectureData.professor}</p>
              <p className="text-xs text-muted-foreground">{lectureData.institution}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
                <ThumbsUp size={16} />
                <span className="text-xs">Like</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
                <MessageCircle size={16} />
                <span className="text-xs">Comment</span>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="about" className="mt-6">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="pt-4">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {lectureData.description}
              </p>
              
              <h3 className="text-lg font-medium mb-2">Notes</h3>
              <div className="bg-sarathi-gray/20 p-3 rounded-lg">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                  {lectureData.notes}
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="materials" className="pt-4">
              <h3 className="text-lg font-medium mb-2">Related Materials</h3>
              <div className="grid gap-2">
                {lectureData.relatedMaterials.map((material) => (
                  <div 
                    key={material.id}
                    className="flex justify-between items-center sarathi-card"
                  >
                    <div>
                      <p className="font-medium">{material.title}</p>
                      <p className="text-xs text-muted-foreground">{material.type}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download size={14} className="mr-1" /> Download
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="comments" className="pt-4">
              <h3 className="text-lg font-medium mb-2">Discussion</h3>
              <div className="grid gap-4">
                {lectureData.comments.map((comment) => (
                  <div key={comment.id} className="sarathi-card">
                    <div className="flex justify-between">
                      <p className="font-medium">{comment.user}</p>
                      <p className="text-xs text-muted-foreground">{comment.time}</p>
                    </div>
                    <p className="text-sm mt-1">{comment.comment}</p>
                  </div>
                ))}
                
                <div className="mt-2">
                  <Button className="w-full">Add Comment</Button>
                  <p className="text-xs text-center mt-2 text-muted-foreground">
                    Comments will sync when you're next online
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default LecturePage;
