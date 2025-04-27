import { useState, useEffect } from "react";
import { Search, Star, Award, Badge, Video, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type IdeaBadge = "innovator" | "creative" | "solver" | "leader" | "contributor";

type Feedback = {
  id: number;
  professorName: string;
  content: string;
  createdAt: string;
};

type Idea = {
  id: number;
  title: string;
  description: string;
  studentName: string;
  studentId: number;
  createdAt: string;
  mediaUrl?: string;
  featured: boolean;
  badges: IdeaBadge[];
  feedback?: Feedback[];
};

const mockIdeas: Idea[] = [
  {
    id: 1,
    title: "Solar-powered Water Purifier for Rural Areas",
    description: "A portable device that uses solar energy to purify water, making clean drinking water accessible to people in rural areas without electricity.",
    studentName: "Priya Sharma",
    studentId: 1,
    createdAt: "2025-04-25T10:30:00Z",
    mediaUrl: "https://placehold.co/600x400/1a237e/ffffff?text=Solar+Purifier+Concept",
    featured: true,
    badges: ["innovator", "solver"],
    feedback: [
      {
        id: 1,
        professorName: "Dr. Ravi Kumar",
        content: "Excellent initiative! Consider adding a filter maintenance schedule to ensure long-term sustainability.",
        createdAt: "2025-04-25T14:30:00Z"
      }
    ]
  },
  {
    id: 2,
    title: "Biodegradable Seed Packaging",
    description: "Packaging made from organic materials embedded with seeds that can be planted directly in soil, eliminating waste and promoting greenery.",
    studentName: "Arjun Patel",
    studentId: 2,
    createdAt: "2025-04-24T14:20:00Z",
    mediaUrl: "https://placehold.co/600x400/26a69a/ffffff?text=Seed+Packaging",
    featured: true,
    badges: ["creative"],
  },
  {
    id: 3,
    title: "Community Learning Exchange App",
    description: "A mobile application that connects students from different schools to share knowledge, resources, and cultural experiences.",
    studentName: "Riya Desai",
    studentId: 3,
    createdAt: "2025-04-23T09:15:00Z",
    featured: false,
    badges: ["contributor"],
  },
  {
    id: 4,
    title: "Smart Waste Segregation System",
    description: "An affordable waste bin system that automatically sorts recyclables, compostables, and general waste using simple sensors.",
    studentName: "Vikram Singh",
    studentId: 4,
    createdAt: "2025-04-22T16:45:00Z",
    mediaUrl: "https://placehold.co/600x400/1a237e/ffffff?text=Waste+Segregation",
    featured: false,
    badges: ["solver"],
  },
  {
    id: 5,
    title: "Peer-to-Peer Homework Assistant Network",
    description: "A platform where students can help each other with homework problems through brief video explanations and voice notes.",
    studentName: "Ananya Kumar",
    studentId: 5,
    createdAt: "2025-04-21T11:30:00Z",
    mediaUrl: "https://placehold.co/600x400/26a69a/ffffff?text=Homework+Network",
    featured: false,
    badges: ["leader", "contributor"],
  },
];

const badgeIcons = {
  innovator: Star,
  creative: Award, 
  solver: Badge,
  leader: Star,
  contributor: Award,
};

const badgeLabels = {
  innovator: "Innovator",
  creative: "Creative Thinker",
  solver: "Problem Solver",
  leader: "Thought Leader",
  contributor: "Top Contributor",
};

const badgeColors = {
  innovator: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
  creative: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  solver: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  leader: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  contributor: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
};

export const CommunityFeed = () => {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackDrafts, setFeedbackDrafts] = useState<{ [key: number]: string }>({});
  const [activeTab, setActiveTab] = useState("all");

  const filteredIdeas = ideas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleFeedbackSubmit = (ideaId: number) => {
    const feedback = feedbackDrafts[ideaId];
    if (!feedback?.trim()) return;

    toast({
      title: "Feedback submitted",
      description: "Your feedback has been sent to the student.",
    });

    setFeedbackDrafts((prev) => {
      const newDrafts = { ...prev };
      delete newDrafts[ideaId];
      return newDrafts;
    });
  };

  const renderIdeaCard = (idea: Idea, showFeedback: boolean = false) => (
    <Card 
      key={idea.id} 
      className={`bg-sarathi-darkCard border-sarathi-gray/30 ${idea.featured ? 'border-l-4 border-l-primary' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg">
              {idea.title}
              {idea.featured && (
                <UIBadge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30">Featured</UIBadge>
              )}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                By {idea.studentName} • {formatDate(idea.createdAt)}
              </span>
              {idea.badges.map((badge) => {
                const BadgeIcon = badgeIcons[badge];
                return (
                  <UIBadge
                    key={badge}
                    variant="outline"
                    className={badgeColors[badge]}
                  >
                    <BadgeIcon size={12} className="mr-1" />
                    {badgeLabels[badge]}
                  </UIBadge>
                );
              })}
            </div>
          </div>

          {userRole === "ngo" && (
            <div className="flex gap-2">
              <UIBadge 
                variant="outline" 
                className="cursor-pointer bg-green-500/10 text-green-500 hover:bg-green-500/20"
              >
                Approve
              </UIBadge>
              <UIBadge 
                variant="outline"
                className="cursor-pointer bg-red-500/10 text-red-500 hover:bg-red-500/20"
              >
                Reject
              </UIBadge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{idea.description}</p>
        
        {idea.mediaUrl && (
          <div className="rounded-lg overflow-hidden mb-4 max-h-[300px]">
            {idea.mediaUrl.includes('video') ? (
              <div className="bg-black/20 h-[200px] flex items-center justify-center">
                <Video size={40} />
              </div>
            ) : (
              <img 
                src={idea.mediaUrl} 
                alt={idea.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        {showFeedback && idea.feedback && idea.feedback.length > 0 && (
          <div className="mt-4 border-t border-sarathi-gray/30 pt-4 space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Professor Feedback</h4>
            {idea.feedback.map((feedback) => (
              <div key={feedback.id} className="bg-sarathi-gray/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={14} className="text-primary" />
                  <span className="text-sm font-medium">{feedback.professorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(feedback.createdAt)}
                  </span>
                </div>
                <p className="text-sm">{feedback.content}</p>
              </div>
            ))}
          </div>
        )}

        {userRole === "professor" && (
          <div className="mt-4 border-t border-sarathi-gray/30 pt-4">
            <div className="flex items-start gap-2">
              <Textarea
                placeholder="Add your feedback to help the student improve..."
                value={feedbackDrafts[idea.id] || ""}
                onChange={(e) => setFeedbackDrafts(prev => ({
                  ...prev,
                  [idea.id]: e.target.value
                }))}
                className="min-h-[80px] bg-sarathi-darkCard border-sarathi-gray/30"
              />
              <Button
                size="sm"
                onClick={() => handleFeedbackSubmit(idea.id)}
                className="shrink-0"
              >
                <MessageSquare className="mr-2" size={16} />
                Send
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search ideas..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {userRole === "student" && (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {sortedIdeas.length === 0 ? (
              <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground">No ideas found matching your search.</p>
                </CardContent>
              </Card>
            ) : (
              sortedIdeas.map(idea => renderIdeaCard(idea, false))
            )}
          </TabsContent>

          <TabsContent value="my-posts" className="mt-6">
            {sortedIdeas.filter(idea => idea.studentId === 1).length === 0 ? (
              <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground">You haven't posted any ideas yet.</p>
                </CardContent>
              </Card>
            ) : (
              sortedIdeas
                .filter(idea => idea.studentId === 1)
                .map(idea => renderIdeaCard(idea, true))
            )}
          </TabsContent>
        </Tabs>
      )}

      {userRole !== "student" && (
        sortedIdeas.length === 0 ? (
          <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">No ideas found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          sortedIdeas.map(idea => renderIdeaCard(idea, userRole === "professor"))
        )
      )}
    </div>
  );
};
