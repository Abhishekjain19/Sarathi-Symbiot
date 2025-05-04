import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play, Users, MessageSquare, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";

const LecturePage = () => {
  const [progress, setProgress] = useState(50);
  const [comment, setComment] = useState("");
  
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { id } = useParams<{ id: string }>();

  const comments = [
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
  ];

  useEffect(() => {
    if (!profile) {
      navigate("/auth");
    }
    
    // Simulate loading progress
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
  }, [profile, navigate, id]);

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden mb-4">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Introduction to React</h1>
            <p className="text-sm text-muted-foreground">Uploaded on 12 May, 2024</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost">
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
                <span>1.2k views</span>
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
              In this lecture, we will cover the basics of React, including components, props, and state.
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
                <Button size="sm">
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
