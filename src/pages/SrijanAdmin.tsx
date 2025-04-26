
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, Star, Edit, X, Plus, CheckCheck } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/App";

// Mock data for flagged content
const flaggedIdeas = [
  {
    id: 1,
    title: "Community Waste Management",
    description: "A spam campaign to promote a commercial waste management service in the local area.",
    studentName: "Rajat Khanna",
    createdAt: "2025-04-24T14:30:00Z",
    reason: "Potential spam/commercial content",
  },
  {
    id: 2,
    title: "Online Platform for Schools",
    description: "This is a platform that connects students from different schools to share inappropriate content and memes.",
    studentName: "Meera Joshi",
    createdAt: "2025-04-23T11:20:00Z",
    reason: "Potentially inappropriate content",
  },
];

// Mock data for weekly challenges
const challenges = [
  {
    id: 1,
    title: "Sustainable Water Conservation",
    description: "Create innovative solutions to help conserve water in daily life.",
    startDate: "2025-04-26T00:00:00Z",
    endDate: "2025-05-03T23:59:59Z",
    isActive: true,
  },
  {
    id: 2,
    title: "Digital Learning Tools",
    description: "Design a digital tool that can help students learn more effectively.",
    startDate: "2025-05-03T00:00:00Z",
    endDate: "2025-05-10T23:59:59Z",
    isActive: false,
  },
];

const SrijanAdmin = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("moderation");
  
  if (!isLoggedIn || userRole !== "ngo") {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold mb-2">Srijan Admin Panel</h1>
        <p className="text-muted-foreground mb-6">
          Manage student ideas, weekly challenges, and moderation
        </p>
        
        <Tabs 
          defaultValue="moderation" 
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="moderation">
              <Flag className="mr-2" size={16} />
              Content Moderation
            </TabsTrigger>
            <TabsTrigger value="challenges">
              <Star className="mr-2" size={16} />
              Weekly Challenges
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="moderation">
            <h2 className="text-lg font-semibold mb-4">Flagged Content</h2>
            
            {flaggedIdeas.length === 0 ? (
              <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No flagged content to review.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {flaggedIdeas.map((idea) => (
                  <Card key={idea.id} className="bg-sarathi-darkCard border-sarathi-gray/30 border-l-4 border-l-yellow-500">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-base">{idea.title}</CardTitle>
                        <Badge className="bg-yellow-500/20 text-yellow-500">
                          Flagged
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        By {idea.studentName} • {new Date(idea.createdAt).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">{idea.description}</p>
                      <p className="text-xs text-amber-400 mb-4">
                        Flagged reason: {idea.reason}
                      </p>
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex items-center"
                        >
                          <X size={16} className="mr-1" />
                          Reject
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex items-center"
                        >
                          <CheckCheck size={16} className="mr-1" />
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="challenges">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Weekly Challenges</h2>
              <Button size="sm" className="flex items-center">
                <Plus size={16} className="mr-1" />
                Create Challenge
              </Button>
            </div>
            
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <Card 
                  key={challenge.id} 
                  className={`bg-sarathi-darkCard border-sarathi-gray/30 ${
                    challenge.isActive ? "border-l-4 border-l-green-500" : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-base">{challenge.title}</CardTitle>
                      <Badge 
                        className={challenge.isActive 
                          ? "bg-green-500/20 text-green-500"
                          : "bg-gray-500/20 text-gray-500"
                        }
                      >
                        {challenge.isActive ? "Active" : "Upcoming"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{challenge.description}</p>
                    <div className="flex flex-wrap justify-between text-xs text-muted-foreground mb-4">
                      <span>Start: {new Date(challenge.startDate).toLocaleDateString()}</span>
                      <span>End: {new Date(challenge.endDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SrijanAdmin;
