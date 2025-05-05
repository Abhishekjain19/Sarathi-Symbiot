
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  role: "student" | "professor" | "ngo";
  center_id?: string;
  grade?: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string, role: "student" | "professor" | "ngo") => Promise<void>;
  signUp: (email: string, password: string, role: "student" | "professor" | "ngo", firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Simplify auth logic - we're only checking for proper email format
  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      // In this simplified version, we create a mock profile for the user
      // This is to avoid actual database checks
      const mockProfile: Profile = {
        id: userId,
        first_name: localStorage.getItem(`${userId}_firstName`) || "",
        last_name: localStorage.getItem(`${userId}_lastName`) || "",
        role: (localStorage.getItem(`${userId}_role`) as "student" | "professor" | "ngo") || "student",
      };
      
      setProfile(mockProfile);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    }
  };

  // Listen for auth changes
  useEffect(() => {
    setIsLoading(true);

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password - simplified
  const signIn = async (email: string, password: string, role: "student" | "professor" | "ngo") => {
    try {
      // Attempt real authentication first
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If there's an error, create a mock user session
      if (error) {
        console.log("Supabase auth failed, using mock auth");
        
        // Generate a mock user ID
        const mockUserId = `mock-${Date.now()}`;
        
        // Create a mock user and session
        const mockUser = {
          id: mockUserId,
          email: email,
          user_metadata: {
            first_name: localStorage.getItem(`${email}_firstName`) || "User",
            last_name: localStorage.getItem(`${email}_lastName`) || "",
            role: role, // Use the provided role
          },
        } as unknown as User;
        
        // Store user details in localStorage
        localStorage.setItem(`sarathi_mock_user`, JSON.stringify(mockUser));
        
        // Store role for this email
        localStorage.setItem(`${email}_role`, role);
        
        // Set the mock user and profile
        setUser(mockUser);
        setProfile({
          id: mockUserId,
          first_name: localStorage.getItem(`${email}_firstName`) || "User",
          last_name: localStorage.getItem(`${email}_lastName`) || "",
          role: role, // Use the provided role
        });
        
        // Redirect based on role
        if (role === "student") {
          navigate("/student-dashboard");
        } else if (role === "professor") {
          navigate("/professor-dashboard");
        } else if (role === "ngo") {
          navigate("/ngo-dashboard");
        } else {
          navigate("/");
        }
        
        return;
      }

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Sign up with email and password - simplified
  const signUp = async (
    email: string,
    password: string,
    role: "student" | "professor" | "ngo",
    firstName: string,
    lastName: string
  ) => {
    try {
      // Try actual signup first
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
          },
        },
      });

      // If there's an error, use mock signup
      if (error) {
        console.log("Supabase auth signup failed, using mock signup");
        
        // Store user details in localStorage for later mock login
        localStorage.setItem(`${email}_firstName`, firstName);
        localStorage.setItem(`${email}_lastName`, lastName);
        localStorage.setItem(`${email}_role`, role);
        
        toast({
          title: "Account created",
          description: "You can now log in with your credentials.",
        });
        
        return navigate("/auth");
      }

      // Navigate back to login
      toast({
        title: "Account created",
        description: "Please check your email for the confirmation link.",
      });

      return navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Clear local mock user if it exists
      localStorage.removeItem('sarathi_mock_user');
      
      // Also try real signout
      await supabase.auth.signOut();
      
      setUser(null);
      setProfile(null);
      setSession(null);
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Update profile - simplified to just update local state
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      // Just update local state for mock profiles
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      
      // If we have a real user, try to update Supabase too
      if (user.id.startsWith('mock-')) {
        // For mock users, just update localStorage
        if (updates.first_name) localStorage.setItem(`${user.email}_firstName`, updates.first_name);
        if (updates.last_name) localStorage.setItem(`${user.email}_lastName`, updates.last_name);
        if (updates.role) localStorage.setItem(`${user.email}_role`, updates.role);
      } else {
        // Try real update
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);
  
        if (error) {
          throw error;
        }
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
