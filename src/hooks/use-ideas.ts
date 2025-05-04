
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useEffect } from "react";

export type Idea = {
  id: string;
  title: string;
  description: string;
  media_url?: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  challenge_id?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
};

export type IdeaDraft = {
  title: string;
  description: string;
  media?: File;
  media_url?: string;
};

export const useIdeas = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useLocalStorage("navigator-online-status", navigator.onLine);
  const [offlineIdeas, setOfflineIdeas] = useLocalStorage<IdeaDraft[]>("navigator-offline-ideas", []);

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      // Attempt to sync when coming back online
      if (navigator.onLine && offlineIdeas.length > 0) {
        syncOfflineIdeas();
      }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [offlineIdeas.length]);

  // Sync offline ideas when back online
  const syncOfflineIdeas = async () => {
    if (!navigator.onLine || !user) return;
    
    const ideasToSync = [...offlineIdeas];
    
    for (const idea of ideasToSync) {
      try {
        let mediaUrl = idea.media_url;
        
        // If there's media to upload
        if (idea.media && navigator.onLine) {
          const file = idea.media;
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;
          
          // Upload the media file
          const { error: uploadError, data } = await supabase.storage
            .from('ideas_media')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          // Get the media URL
          const { data: { publicUrl } } = supabase.storage
            .from('ideas_media')
            .getPublicUrl(filePath);
            
          mediaUrl = publicUrl;
        }
        
        // Insert the idea into the database
        const { error } = await supabase
          .from('ideas')
          .insert({
            title: idea.title,
            description: idea.description,
            media_url: mediaUrl,
            user_id: user.id,
            status: 'pending'
          });
          
        if (error) throw error;
        
        // Remove from offline storage after successful sync
        setOfflineIdeas((prev: IdeaDraft[]) => prev.filter(i => i !== idea));
        
        toast({
          title: "Idea synced!",
          description: "Your idea has been submitted for approval.",
        });
      } catch (error) {
        console.error("Error syncing idea:", error);
      }
    }
    
    // Refresh the ideas list
    queryClient.invalidateQueries({ queryKey: ["ideas"] });
  };

  // Get all ideas (with filters for approved/student's own)
  const getIdeas = async () => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('ideas')
      .select('*, profiles:user_id(first_name, last_name)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Cast the data to the expected type
    return data as unknown as Idea[];
  };

  // Get a single idea by ID
  const getIdeaById = async (id: string) => {
    if (!id) return null;
    
    const { data, error } = await supabase
      .from('ideas')
      .select('*, profiles:user_id(first_name, last_name)')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    // Cast the data to the expected type
    return data as unknown as Idea;
  };

  // Submit a new idea
  const submitIdea = async (ideaData: IdeaDraft) => {
    if (!user) throw new Error("User not authenticated");
    
    // If offline, store locally
    if (!navigator.onLine) {
      setOfflineIdeas((prev: IdeaDraft[]) => [...prev, ideaData]);
      toast({
        title: "Saved offline",
        description: "Your idea will be submitted when you're back online.",
      });
      return;
    }
    
    let mediaUrl = undefined;
    
    // Upload media if provided
    if (ideaData.media) {
      const file = ideaData.media;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('ideas_media')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('ideas_media')
        .getPublicUrl(filePath);
        
      mediaUrl = publicUrl;
    }
    
    // Submit the idea
    const { data, error } = await supabase
      .from('ideas')
      .insert({
        title: ideaData.title,
        description: ideaData.description,
        media_url: mediaUrl,
        user_id: user.id,
        status: 'pending'
      })
      .select();
      
    if (error) throw error;
    return data[0] as Idea;
  };

  // Update idea status (for NGO admins)
  const updateIdeaStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { data, error } = await supabase
      .from('ideas')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0] as Idea;
  };

  // Get current weekly challenge
  const getCurrentChallenge = async () => {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .lte('start_date', now)
      .gte('end_date', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No active challenge found
        return null;
      }
      throw error;
    }
    
    return data;
  };

  // Create a weekly challenge (for NGO admins)
  const createChallenge = async (challenge: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
  }) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        ...challenge,
        created_by: user.id
      })
      .select();
      
    if (error) throw error;
    return data[0];
  };

  // Use React Query to manage state and cache
  const {
    data: ideas,
    isLoading: isLoadingIdeas,
    error: ideasError,
  } = useQuery({
    queryKey: ["ideas"],
    queryFn: getIdeas,
    enabled: !!user && navigator.onLine,
  });

  const {
    data: currentChallenge,
    isLoading: isLoadingChallenge,
  } = useQuery({
    queryKey: ["currentChallenge"],
    queryFn: getCurrentChallenge,
    enabled: navigator.onLine,
  });

  const submitIdeaMutation = useMutation({
    mutationFn: submitIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast({
        title: "Idea submitted",
        description: "Your idea is now awaiting approval.",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => 
      updateIdeaStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast({
        title: "Status updated",
        description: "The idea status has been updated successfully.",
      });
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: createChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentChallenge"] });
      toast({
        title: "Challenge created",
        description: "New weekly challenge has been created successfully.",
      });
    },
  });

  return {
    ideas,
    isLoadingIdeas,
    ideasError,
    currentChallenge,
    isLoadingChallenge,
    isOnline,
    offlineIdeas,
    getIdeaById,
    submitIdea: submitIdeaMutation.mutate,
    isSubmittingIdea: submitIdeaMutation.isPending,
    updateIdeaStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    createChallenge: createChallengeMutation.mutate,
    isCreatingChallenge: createChallengeMutation.isPending,
    syncOfflineIdeas,
  };
};
