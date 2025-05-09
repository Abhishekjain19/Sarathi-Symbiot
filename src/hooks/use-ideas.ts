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
  // Make profiles optional to handle cases where join might not work
  profiles?: {
    first_name: string | null;
    last_name: string | null;
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

// Dummy posts for Srijan community feed
const DUMMY_IDEAS: Idea[] = [
  {
    id: "dummy1",
    title: "Solar-Powered School Bag",
    description: "A backpack with built-in solar panels to charge devices and power a small reading light for students in rural areas.",
    media_url: null,
    user_id: "user1",
    status: "approved",
    challenge_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    profiles: { first_name: "Aarav", last_name: "Sharma" }
  },
  {
    id: "dummy2",
    title: "Plastic Bottle Brick Construction",
    description: "Using discarded plastic bottles filled with sand as eco-friendly bricks for building low-cost classrooms.",
    media_url: null,
    user_id: "user2",
    status: "approved",
    challenge_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    profiles: { first_name: "Meera", last_name: "Patel" }
  },
  {
    id: "dummy3",
    title: "Community Library on Wheels",
    description: "A mobile library van that brings books and digital learning to remote villages every week.",
    media_url: null,
    user_id: "user3",
    status: "approved",
    challenge_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    profiles: { first_name: "Rahul", last_name: "Verma" }
  },
  {
    id: "dummy4",
    title: "Rainwater Harvesting for Schools",
    description: "A simple rainwater collection system to provide clean water for handwashing and gardening in government schools.",
    media_url: null,
    user_id: "user4",
    status: "approved",
    challenge_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    profiles: { first_name: "Simran", last_name: "Kaur" }
  },
  {
    id: "dummy5",
    title: "Interactive Science Wall",
    description: "A painted wall in the schoolyard with science puzzles, math games, and fun facts for students to interact with during breaks.",
    media_url: null,
    user_id: "user5",
    status: "approved",
    challenge_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    profiles: { first_name: "Priya", last_name: "Nair" }
  },
  {
    id: "dummy6",
    title: "Smart Attendance System",
    description: "A mobile app that uses QR codes to mark student attendance quickly and accurately, reducing paperwork for teachers.",
    media_url: null,
    user_id: "user6",
    status: "approved",
    challenge_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    profiles: { first_name: "Tanvi", last_name: "Reddy" }
  },
  {
    id: "dummy7",
    title: "Green School Initiative",
    description: "A student-led campaign to plant trees and create a vegetable garden in the schoolyard, promoting sustainability and healthy eating.",
    media_url: null,
    user_id: "user7",
    status: "approved",
    challenge_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    profiles: { first_name: "Mohammed", last_name: "Iqbal" }
  },
  {
    id: "dummy8",
    title: "Recycled Art Competition",
    description: "An annual event where students create art and models from recycled materials, raising awareness about waste management.",
    media_url: null,
    user_id: "user8",
    status: "approved",
    challenge_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 16).toISOString(),
    profiles: { first_name: "Fatima", last_name: "Sheikh" }
  },
  {
    id: "dummy9",
    title: "Peer Tutoring Program",
    description: "Older students volunteer to tutor younger students in math and science, building leadership and teamwork skills.",
    media_url: null,
    user_id: "user9",
    status: "approved",
    challenge_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    profiles: { first_name: "Ritika", last_name: "Jain" }
  },
  {
    id: "dummy10",
    title: "Water Bottle Refill Station",
    description: "A student-designed water station that encourages everyone to refill bottles instead of buying new plastic ones.",
    media_url: null,
    user_id: "user10",
    status: "approved",
    challenge_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    profiles: { first_name: "Sahil", last_name: "Chopra" }
  }
];

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
      
      // Modified query to avoid using relationships
      const { data: ideasData, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // If we have ideas, fetch profiles for each idea
      if (ideasData && ideasData.length > 0) {
        // Get unique user IDs to batch fetch profiles
        const userIds = [...new Set(ideasData.map(idea => idea.user_id))];
        
        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError.message);
          // Continue anyway, we'll show ideas without profiles
        }
        
        // Create a map of user_id to profile data for quick lookup
        const profileMap = profilesData ? profilesData.reduce((map: Record<string, any>, profile: any) => {
          map[profile.id] = profile;
          return map;
        }, {}) : {};
        
        // Combine ideas with their profiles and cast to proper type
        const ideasWithProfiles = ideasData.map(idea => ({
          ...idea,
          status: idea.status as "pending" | "approved" | "rejected", // Type cast status to expected values
          profiles: profileMap[idea.user_id] || { first_name: null, last_name: null }
        })) as Idea[]; // Cast the entire array to Idea[]
        
        if ((ideasWithProfiles && ideasWithProfiles.length === 0) || !ideasWithProfiles) {
          setIdeas([...DUMMY_IDEAS]);
        } else {
          setIdeas([...ideasWithProfiles, ...DUMMY_IDEAS]);
        }
      } else {
        setIdeas([...DUMMY_IDEAS]);
      }
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
      // Modified query to avoid using relationships
      const { data: pendingData, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // If we have pending ideas, fetch profiles for each
      if (pendingData && pendingData.length > 0) {
        // Get unique user IDs to batch fetch profiles
        const userIds = [...new Set(pendingData.map(idea => idea.user_id))];
        
        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError.message);
          // Continue anyway, we'll show ideas without profiles
        }
        
        // Create a map of user_id to profile data for quick lookup
        const profileMap = profilesData ? profilesData.reduce((map: Record<string, any>, profile: any) => {
          map[profile.id] = profile;
          return map;
        }, {}) : {};
        
        // Combine ideas with their profiles and cast to proper type
        const pendingWithProfiles = pendingData.map(idea => ({
          ...idea,
          status: idea.status as "pending" | "approved" | "rejected", // Type cast status to expected values
          profiles: profileMap[idea.user_id] || { first_name: null, last_name: null }
        })) as Idea[]; // Cast the entire array to Idea[]
        
        setPendingIdeas(pendingWithProfiles);
      } else {
        setPendingIdeas([]);
      }
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
