import { useState, useEffect } from "react";
import { Flag, Star, Edit, X, Plus, CheckCheck, Shield } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useIdeas } from "@/hooks/use-ideas";
import { useNavigate } from "react-router-dom";

// Simple AI moderation function - in a real app this would be a backend service
const analyzeSentiment = (text: string) => {
  // List of words to check against
  const inappropriateWords = ['spam', 'offensive', 'inappropriate', 'hate', 'violent'];
  const commercialWords = ['buy now', 'discount', 'offer', 'sale', 'promotion'];
  
  const hasInappropriate = inappropriateWords.some(word => 
    text.toLowerCase().includes(word)
  );
  
  const hasCommercial = commercialWords.some(word => 
    text.toLowerCase().includes(word)
  );
  
  if (hasInappropriate) {
    return {
      status: 'rejected',
      reason: 'Content contains inappropriate language',
      confidence: 0.85
    };
  }
  
  if (hasCommercial) {
    return {
      status: 'flagged',
      reason: 'Potential commercial/spam content',
      confidence: 0.75
    };
  }
  
  return {
    status: 'approved',
    reason: 'Content appears appropriate',
    confidence: 0.95
  };
};

const SrijanAdmin = () => {
  const navigate = useNavigate();
  const { isLoading, profile } = useAuth();
  const { 
    ideas, 
    pendingIdeas,
    loading: isLoadingIdeas,
    updateIdeaStatus,
    currentChallenge,
    createChallenge
  } = useIdeas();
  const [activeTab, setActiveTab] = useState("moderation");
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-sarathi-dark flex items-center justify-center">
        <div className="animate-spin rounded-full border-t-4 border-primary border-opacity-50 h-12 w-12"></div>
      </div>
    );
  }
  
  if (!profile || profile.role !== "ngo") {
    // Redirect non-NGO users
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold mb-2">Ideas Admin Panel</h1>
        <p className="text-muted-foreground mb-6">
          Manage student ideas, weekly challenges, and moderation
        </p>
        
        <Tabs 
          defaultValue="moderation" 
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="moderation">
              <Flag className="mr-2" size={16} />
              Content Moderation
            </TabsTrigger>
            <TabsTrigger value="challenges">
              <Star className="mr-2" size={16} />
              Weekly Challenges
            </TabsTrigger>
            <TabsTrigger value="ai-analysis">
              <Shield className="mr-2" size={16} />
              AI Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="moderation">
            <h2 className="text-lg font-semibold mb-4">Pending Content</h2>
            
            {isLoadingIdeas ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="bg-sarathi-darkCard border-sarathi-gray/30 animate-pulse">
                    <CardHeader>
                      <div className="h-5 bg-sarathi-gray/20 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-sarathi-gray/20 rounded w-1/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-sarathi-gray/20 rounded w-full mb-2"></div>
                      <div className="h-4 bg-sarathi-gray/20 rounded w-5/6"></div>
                      <div className="flex justify-end gap-2 mt-4">
                        <div className="h-8 bg-sarathi-gray/20 rounded w-24"></div>
                        <div className="h-8 bg-sarathi-gray/20 rounded w-24"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pendingIdeas.length === 0 ? (
              <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No pending content to review.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingIdeas.map((idea) => (
                  <Card key={idea.id} className="bg-sarathi-darkCard border-sarathi-gray/30 border-l-4 border-l-yellow-500">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-base">{idea.title}</CardTitle>
                        <Badge className="bg-yellow-500/20 text-yellow-500">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        By {idea.profiles?.first_name} {idea.profiles?.last_name} • {new Date(idea.created_at).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{idea.description}</p>
                      
                      {idea.media_url && (
                        <div className="rounded-lg overflow-hidden mb-4 max-h-[200px]">
                          <img 
                            src={idea.media_url} 
                            alt={idea.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="flex items-center"
                          onClick={() => updateIdeaStatus({ id: idea.id, status: 'rejected' })}
                        >
                          <X size={16} className="mr-1" />
                          Reject
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex items-center"
                          onClick={() => updateIdeaStatus({ id: idea.id, status: 'approved' })}
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
              <h2 className="text-lg font-semibold">Weekly Challenge</h2>
              <Button size="sm" className="flex items-center">
                <Plus size={16} className="mr-1" />
                Create Challenge
              </Button>
            </div>
            
            {currentChallenge ? (
              <Card className="bg-sarathi-darkCard border-sarathi-gray/30 border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">{currentChallenge.title}</CardTitle>
                    <Badge className="bg-green-500/20 text-green-500">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{currentChallenge.description}</p>
                  <div className="flex flex-wrap justify-between text-xs text-muted-foreground mb-4">
                    <span>Start: {new Date(currentChallenge.start_date).toLocaleDateString()}</span>
                    <span>End: {new Date(currentChallenge.end_date).toLocaleDateString()}</span>
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
            ) : (
              <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No active challenge. Create a new one to engage students!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="ai-analysis">
            <h2 className="text-lg font-semibold mb-4">AI Content Analysis</h2>
            
            {isLoadingIdeas ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="bg-sarathi-darkCard border-sarathi-gray/30 animate-pulse">
                    <CardHeader>
                      <div className="h-5 bg-sarathi-gray/20 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-sarathi-gray/20 rounded w-1/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-sarathi-gray/20 rounded w-full mb-2"></div>
                      <div className="h-4 bg-sarathi-gray/20 rounded w-5/6 mb-4"></div>
                      <div className="h-4 bg-sarathi-gray/20 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-sarathi-gray/20 rounded w-1/2 mb-4"></div>
                      <div className="flex justify-end gap-2 mt-4">
                        <div className="h-8 bg-sarathi-gray/20 rounded w-24"></div>
                        <div className="h-8 bg-sarathi-gray/20 rounded w-24"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pendingIdeas.length === 0 ? (
              <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No content to analyze.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingIdeas.map((idea) => {
                  const analysis = analyzeSentiment(idea.description);
                  const statusColors = {
                    approved: 'bg-green-500/20 text-green-500',
                    flagged: 'bg-yellow-500/20 text-yellow-500',
                    rejected: 'bg-red-500/20 text-red-500'
                  };
                  
                  return (
                    <Card key={idea.id} className="bg-sarathi-darkCard border-sarathi-gray/30">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-base">{idea.title}</CardTitle>
                          <Badge className={statusColors[analysis.status as keyof typeof statusColors]}>
                            {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          By {idea.profiles?.first_name} {idea.profiles?.last_name} • {new Date(idea.created_at).toLocaleDateString()}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-2">{idea.description}</p>
                        <div className="text-sm space-y-2 mb-4">
                          <p className="text-muted-foreground">
                            AI Analysis: {analysis.reason}
                          </p>
                          <p className="text-muted-foreground">
                            Confidence: {(analysis.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex items-center"
                            onClick={() => updateIdeaStatus({ id: idea.id, status: 'rejected' })}
                          >
                            <X size={16} className="mr-1" />
                            Override & Reject
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex items-center"
                            onClick={() => updateIdeaStatus({ id: idea.id, status: 'approved' })}
                          >
                            <CheckCheck size={16} className="mr-1" />
                            Override & Approve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SrijanAdmin;
