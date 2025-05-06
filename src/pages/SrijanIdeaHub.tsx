
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { IdeaSubmissionForm } from "@/components/srijan/IdeaSubmissionForm";
import { CommunityFeed } from "@/components/srijan/CommunityFeed";
import { WeeklyChallengeCard } from "@/components/srijan/WeeklyChallengeCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useIdeas } from "@/hooks/use-ideas";

const SrijanIdeaHub = () => {
  const navigate = useNavigate();
  const { isLoading, profile } = useAuth();
  const { toast } = useToast();
  const { 
    addIdea: submitIdea, 
    currentChallenge,
    isLoadingChallenge,
    isOnline
  } = useIdeas();
  const [activeTab, setActiveTab] = useState<string>("feed");

  // Handle authentication loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-sarathi-dark flex items-center justify-center">
        <div className="animate-spin rounded-full border-t-4 border-primary border-opacity-50 h-12 w-12"></div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  useEffect(() => {
    if (!isLoading && !profile) {
      navigate("/auth");
    }
  }, [isLoading, profile, navigate]);

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold mb-2">Ideas Hub</h1>
        <p className="text-muted-foreground mb-6">
          Share your innovative ideas and get recognized by the community
        </p>
        
        <WeeklyChallengeCard 
          challenge={currentChallenge} 
          isLoading={isLoadingChallenge} 
        />
        
        <Tabs
          defaultValue="feed"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="submit">Submit Idea</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="mt-0">
            <CommunityFeed />
          </TabsContent>
          
          <TabsContent value="submit" className="mt-0">
            <IdeaSubmissionForm 
              onSubmitSuccess={() => {
                setActiveTab("feed");
                toast({
                  title: "Idea submitted successfully!",
                  description: isOnline ? 
                    "Your idea is now waiting for approval." : 
                    "Your idea will be submitted when you're back online.",
                });
              }}
              submitIdea={submitIdea}
              isOnline={isOnline}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SrijanIdeaHub;
