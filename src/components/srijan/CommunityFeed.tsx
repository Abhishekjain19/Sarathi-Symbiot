
import { useState } from "react";
import { Search, Star, Award, Badge, Video, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIdeas } from "@/hooks/use-ideas";
import { Skeleton } from "@/components/ui/skeleton";

type IdeaBadge = "innovator" | "creative" | "solver" | "leader" | "contributor";

// In a real app, these would come from a database table
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
  const { profile } = useAuth();
  const { toast } = useToast();
  const { ideas, isLoadingIdeas, updateIdeaStatus } = useIdeas();
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackDrafts, setFeedbackDrafts] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState("all");

  // Generate random badges for demo purposes
  // In a real app, these would come from backend logic
  const getRandomBadges = (id: string): IdeaBadge[] => {
    const seed = parseInt(id.substring(0, 8), 16);
    const possibleBadges: IdeaBadge[] = ["innovator", "creative", "solver", "leader", "contributor"];
    const numBadges = seed % 3 + 1; // 1-3 badges
    
    const badges: IdeaBadge[] = [];
    for (let i = 0; i < numBadges; i++) {
      const idx = (seed + i) % possibleBadges.length;
      badges.push(possibleBadges[idx]);
    }
    
    return badges;
  };

  const filteredIdeas = ideas?.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (idea.profiles && 
     (idea.profiles.first_name + ' ' + idea.profiles.last_name)
      .toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Only show approved ideas for students and professors
  // NGOs can see all ideas
  const visibleIdeas = profile?.role === 'ngo'
    ? filteredIdeas
    : filteredIdeas.filter(idea => idea.status === 'approved' || idea.user_id === profile?.id);

  const sortedIdeas = [...visibleIdeas].sort((a, b) => {
    // "Featured" ideas are approved ones
    if (a.status === 'approved' && b.status !== 'approved') return -1;
    if (a.status !== 'approved' && b.status === 'approved') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleFeedbackSubmit = (ideaId: string) => {
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

  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    updateIdeaStatus({ id, status });
  };

  const renderIdeaCard = (idea: any, showFeedback: boolean = false) => {
    const badges = getRandomBadges(idea.id);
    const isFeatured = idea.status === 'approved';
    
    return (
      <Card 
        key={idea.id} 
        className={`bg-sarathi-darkCard border-sarathi-gray/30 ${isFeatured ? 'border-l-4 border-l-primary' : ''}`}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <div>
              <CardTitle className="text-lg">
                {idea.title}
                {isFeatured && (
                  <UIBadge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30">Featured</UIBadge>
                )}
                {idea.status === 'pending' && (
                  <UIBadge className="ml-2 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">Pending</UIBadge>
                )}
                {idea.status === 'rejected' && (
                  <UIBadge className="ml-2 bg-red-500/20 text-red-500 hover:bg-red-500/30">Rejected</UIBadge>
                )}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  By {idea.profiles?.first_name} {idea.profiles?.last_name} • {formatDate(idea.created_at)}
                </span>
                {badges.map((badge) => {
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

            {profile?.role === "ngo" && idea.status === 'pending' && (
              <div className="flex gap-2">
                <UIBadge 
                  variant="outline" 
                  className="cursor-pointer bg-green-500/10 text-green-500 hover:bg-green-500/20"
                  onClick={() => handleStatusChange(idea.id, 'approved')}
                >
                  Approve
                </UIBadge>
                <UIBadge 
                  variant="outline"
                  className="cursor-pointer bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  onClick={() => handleStatusChange(idea.id, 'rejected')}
                >
                  Reject
                </UIBadge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">{idea.description}</p>
          
          {idea.media_url && (
            <div className="rounded-lg overflow-hidden mb-4 max-h-[300px]">
              {idea.media_url.includes('video') ? (
                <div className="bg-black/20 h-[200px] flex items-center justify-center">
                  <Video size={40} />
                </div>
              ) : (
                <img 
                  src={idea.media_url} 
                  alt={idea.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}

          {/* Feedback form for professors */}
          {profile?.role === "professor" && (
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
                  <MessageCircle className="mr-2" size={16} />
                  Send
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="bg-sarathi-darkCard border-sarathi-gray/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-48 bg-sarathi-gray/20" />
              <Skeleton className="h-6 w-20 bg-sarathi-gray/20" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Skeleton className="h-4 w-32 bg-sarathi-gray/20" />
              <Skeleton className="h-4 w-24 bg-sarathi-gray/20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full bg-sarathi-gray/20 mb-2" />
            <Skeleton className="h-4 w-4/5 bg-sarathi-gray/20 mb-2" />
            <Skeleton className="h-32 w-full bg-sarathi-gray/20 rounded-lg mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>
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

      {profile?.role === "student" && (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {isLoadingIdeas ? renderLoadingState() : (
              sortedIdeas.length === 0 ? (
                <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No ideas found matching your search.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedIdeas.map(idea => renderIdeaCard(idea, false))}
                </div>
              )
            )}
          </TabsContent>

          <TabsContent value="my-posts" className="mt-6">
            {isLoadingIdeas ? renderLoadingState() : (
              sortedIdeas.filter(idea => idea.user_id === profile?.id).length === 0 ? (
                <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">You haven't posted any ideas yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedIdeas
                    .filter(idea => idea.user_id === profile?.id)
                    .map(idea => renderIdeaCard(idea, true))
                  }
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
      )}

      {profile?.role !== "student" && (
        isLoadingIdeas ? renderLoadingState() : (
          sortedIdeas.length === 0 ? (
            <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">No ideas found matching your search.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedIdeas.map(idea => renderIdeaCard(idea, profile?.role === "professor"))}
            </div>
          )
        )
      )}
    </div>
  );
};
