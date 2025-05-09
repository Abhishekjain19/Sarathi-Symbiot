
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, MessageSquare, Download, Share2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Default lecture data as fallback
const defaultLecture = {
  id: "default",
  title: "Introduction to React",
  uploaded_at: "12 May, 2024",
  views: 1200,
  subject: "Computer Science",
  grade: "8th",
  description: "In this lecture, we will cover the basics of React, including components, props, and state.",
  file_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Fallback URL
  professor: "Dr. Johnson",
  duration: 45,
};

const LecturePage = () => {
  const [progress, setProgress] = useState(0);
  const [comment, setComment] = useState("");
  const [lecture, setLecture] = useState(defaultLecture);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "Alice",
      comment: "Great explanation!",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      user: "Bob",
      comment: "Could you explain this concept in more detail?",
      timestamp: "1 hour ago",
    },
  ]);
  
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const videoRef = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!profile) {
      navigate("/auth");
      return;
    }
    
    const fetchLecture = async () => {
      try {
        if (!id) return;

        // Fetch lecture data from Supabase
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error("Error fetching lecture details:", error);
          toast({
            title: "Error loading lecture",
            description: "Using demonstration content instead.",
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          setLecture({
            id: data.id,
            title: data.title,
            uploaded_at: new Date(data.created_at || "").toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            views: data.downloads || 1200,
            subject: data.subject || "General",
            grade: data.grade || "Unknown",
            description: data.description || defaultLecture.description,
            file_url: data.file_url || defaultLecture.file_url,
            professor: data.uploaded_by ? "Prof. " + data.uploaded_by : "Unknown Professor",
            duration: data.duration || 45,
          });
        }
      } catch (err) {
        console.error("Error in lecture fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLecture();
    
    // Simulate loading progress for video
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [profile, navigate, id, toast]);

  const handleAddComment = () => {
    if (!comment.trim()) return;
    
    // Add new comment to the list
    setComments([
      ...comments,
      {
        id: comments.length + 1,
        user: profile?.first_name || "Student",
        comment: comment,
        timestamp: "Just now",
      },
    ]);
    
    // Clear comment input
    setComment("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sarathi-dark text-white">
        <NavBar />
        <main className="container max-w-4xl mx-auto px-4 py-6 pb-20">
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden mb-4 bg-sarathi-darkCard animate-pulse"></div>
          <div className="animate-pulse">
            <div className="h-8 bg-sarathi-darkCard rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-sarathi-darkCard rounded w-1/2 mb-4"></div>
          </div>
        </main>
      </div>
    );
  }

  const isYouTubeLink = lecture.file_url?.includes('youtube.com') || lecture.file_url?.includes('youtu.be');

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden mb-4 bg-black">
          {isYouTubeLink ? (
            <iframe
              src={lecture.file_url}
              title={lecture.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <video
              ref={(el) => videoRef[1] = el}
              src={lecture.file_url || ""}
              controls
              className="w-full h-full"
              poster="https://placehold.co/1280x720/1a237e/ffffff?text=Video+Lecture"
              onTimeUpdate={(e) => {
                const video = e.currentTarget;
                const percentage = (video.currentTime / video.duration) * 100;
                setProgress(Math.round(percentage));
              }}
            >
              Your browser does not support the video element.
            </video>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{lecture.title}</h1>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <p>Uploaded on {lecture.uploaded_at}</p>
              <p>•</p>
              <p>Grade: {lecture.grade}</p>
              <p>•</p>
              <p>Subject: {lecture.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => {
              const videoElement = videoRef[1];
              if (videoElement) {
                if (videoElement.paused) {
                  videoElement.play();
                } else {
                  videoElement.pause();
                }
              }
            }}>
              <Play size={16} className="mr-2" />
              Continue Watching
            </Button>
          </div>
        </div>

        <Card className="bg-sarathi-darkCard border-sarathi-gray/30 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-muted-foreground" />
                <span>{lecture.views} views</span>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 size={16} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>
            <h2 className="text-xl font-medium mb-2">About this lecture</h2>
            <p className="text-sm text-muted-foreground">
              {lecture.description}
            </p>
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Progress</h3>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
          <CardContent className="p-6">
            <h2 className="text-xl font-medium mb-4">Discussion</h2>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${comment.user}`} />
                    <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{comment.user}</span>
                      <span className="text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Label htmlFor="comment" className="text-sm">Add a comment</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="comment"
                  placeholder="Type your comment here"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-sarathi-darkInput border-sarathi-gray/30 text-sm"
                />
                <Button size="sm" onClick={handleAddComment}>
                  <MessageSquare size={16} className="mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LecturePage;
