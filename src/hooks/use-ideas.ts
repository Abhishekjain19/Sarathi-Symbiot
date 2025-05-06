import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

// Define types for ideas
export interface Idea {
  id: string;
  title: string;
  description: string;
  media_url: string | null;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  challenge_id: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface IdeaDraft {
  title: string;
  description: string;
  media_url?: string | null;
  status?: "pending";
  challenge_id?: string | null;
  localId?: string;
  media_file?: File;
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideaDrafts, setIdeaDrafts] = useState<IdeaDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);
  const [pendingIdeas, setPendingIdeas] = useState<Idea[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { profile } = useAuth();

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load offline stored drafts from localStorage
  useEffect(() => {
    const loadOfflineDrafts = () => {
      try {
        const draftsJson = localStorage.getItem("ideaDrafts");
        if (draftsJson) {
          const drafts = JSON.parse(draftsJson);
          setIdeaDrafts(drafts);
        }
      } catch (error) {
        console.error("Error loading offline drafts:", error);
      }
    };

    loadOfflineDrafts();
  }, []);

  // Save drafts to localStorage whenever they change
  useEffect(() => {
    if (ideaDrafts.length > 0) {
      localStorage.setItem("ideaDrafts", JSON.stringify(ideaDrafts));
    }
  }, [ideaDrafts]);

  // Fetch current challenge
  const fetchCurrentChallenge = async () => {
    try {
      setIsLoadingChallenge(true);
      
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .lte("start_date", now)
        .gte("end_date", now)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine
        console.error("Error fetching challenge:", error);
      } else if (data) {
        setCurrentChallenge(data as Challenge);
      }
    } catch (error: any) {
      console.error("Error fetching challenge:", error.message);
    } finally {
      setIsLoadingChallenge(false);
    }
  };

  // Fetch ideas from Supabase
  const fetchIdeas = async () => {
    try {
      setIsLoadingIdeas(true);
      
      const { data, error } = await supabase
        .from("ideas")
        .select(`
          *,
          profiles:user_id(first_name, last_name)
        `)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Type assertion to handle the Supabase response
      setIdeas(data as unknown as Idea[]);
    } catch (error: any) {
      console.error("Error fetching ideas:", error.message);
      toast({
        title: "Error fetching ideas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingIdeas(false);
      setLoading(false);
    }
  };

  // Fetch pending ideas for moderation (NGO users only)
  const fetchPendingIdeas = async () => {
    if (profile?.role !== "ngo") return;
    
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select(`
          *,
          profiles(first_name, last_name)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Type assertion to handle the Supabase response
      setPendingIdeas(data as unknown as Idea[]);
    } catch (error: any) {
      console.error("Error fetching pending ideas:", error.message);
    }
  };

  // Add a new idea (offline-first approach)
  const addIdea = (newIdea: IdeaDraft) => {
    // Add a local ID to track this draft
    const draftWithId = {
      ...newIdea,
      localId: Date.now().toString(),
      status: "pending" as const,
    };
    
    // Add to local drafts
    setIdeaDrafts((prev) => [...prev, draftWithId]);
    
    // If online, try to submit right away
    if (navigator.onLine) {
      syncIdeas();
    } else {
      toast({
        title: "Saved locally",
        description: "Your idea will be submitted when you're back online",
      });
    }
  };

  // Create new challenge (for NGO users)
  const createChallenge = async (challenge: Omit<Challenge, 'id' | 'created_at' | 'updated_at'>) => {
    if (!profile || profile.role !== "ngo") return null;
    
    try {
      const { data, error } = await supabase
        .from("challenges")
        .insert([
          {
            ...challenge,
            created_by: profile.id,
          }
        ])
        .select();
        
      if (error) {
        throw error;
      }
      
      fetchCurrentChallenge();
      return data[0] as Challenge;
    } catch (error: any) {
      console.error("Error creating challenge:", error.message);
      toast({
        title: "Error creating challenge",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Sync offline drafts with Supabase when online
  const syncIdeas = async () => {
    if (!profile || ideaDrafts.length === 0) return;
    
    for (const draft of ideaDrafts) {
      try {
        const { data, error } = await supabase
          .from("ideas")
          .insert([
            {
              title: draft.title,
              description: draft.description,
              media_url: draft.media_url || null,
              user_id: profile.id,
              status: "pending",
              challenge_id: draft.challenge_id || null,
            },
          ])
          .select();
          
        if (error) {
          throw error;
        }
        
        // On successful sync, remove from drafts
        setIdeaDrafts((prev) => prev.filter(d => d.localId !== draft.localId));
        
        toast({
          title: "Idea submitted",
          description: "Your idea was successfully submitted for approval",
        });
        
        // Refresh ideas list
        fetchIdeas();
      } catch (error: any) {
        console.error("Error syncing idea:", error.message);
        toast({
          title: "Error submitting idea",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  // Update idea status (for NGO moderation)
  const updateIdeaStatus = async ({ id, status }: { id: string, status: "approved" | "rejected" }) => {
    try {
      const { error } = await supabase
        .from("ideas")
        .update({ status })
        .eq("id", id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setPendingIdeas(prev => prev.filter(idea => idea.id !== id));
      
      if (status === "approved") {
        fetchIdeas(); // Refresh approved ideas
      }
      
      toast({
        title: `Idea ${status}`,
        description: `The idea has been ${status} successfully`,
      });
    } catch (error: any) {
      console.error(`Error ${status} idea:`, error.message);
      toast({
        title: `Error ${status} idea`,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Effect to fetch ideas on component mount and when profile changes
  useEffect(() => {
    fetchIdeas();
    fetchCurrentChallenge();
    
    if (profile?.role === "ngo") {
      fetchPendingIdeas();
    }
    
    // Set up online/offline detection for syncing
    const handleOnline = () => {
      if (ideaDrafts.length > 0) {
        syncIdeas();
      }
    };
    
    window.addEventListener("online", handleOnline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [profile]);

  // Alias submitIdea to addIdea for backwards compatibility
  const submitIdea = addIdea;

  return {
    ideas,
    pendingIdeas,
    loading,
    isLoadingIdeas,
    addIdea,
    submitIdea,
    updateIdeaStatus,
    ideaDrafts: ideaDrafts.length,
    currentChallenge,
    isLoadingChallenge,
    createChallenge,
    isOnline
  };
}
