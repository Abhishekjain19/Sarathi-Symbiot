
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

export interface IdeaDraft {
  title: string;
  description: string;
  media_url?: string | null;
  status: "pending";
  challenge_id?: string | null;
  localId?: string;
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideaDrafts, setIdeaDrafts] = useState<IdeaDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingIdeas, setPendingIdeas] = useState<Idea[]>([]);
  const { profile } = useAuth();

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

  // Fetch ideas from Supabase
  const fetchIdeas = async () => {
    try {
      setLoading(true);
      
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
      
      setIdeas(data as unknown as Idea[]);
    } catch (error: any) {
      console.error("Error fetching ideas:", error.message);
      toast({
        title: "Error fetching ideas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
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
          profiles:user_id(first_name, last_name)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
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
  const updateIdeaStatus = async (ideaId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("ideas")
        .update({ status })
        .eq("id", ideaId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setPendingIdeas(prev => prev.filter(idea => idea.id !== ideaId));
      
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
    
    if (profile?.role === "ngo") {
      fetchPendingIdeas();
    }
    
    // Set up online/offline detection
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

  return {
    ideas,
    pendingIdeas,
    loading,
    addIdea,
    updateIdeaStatus,
    ideaDrafts: ideaDrafts.length,
  };
}
