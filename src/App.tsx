import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { createContext, useContext } from "react";

// Pages
import Landing from "./pages/Landing";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import LecturePage from "./pages/LecturePage";
import AssessmentPage from "./pages/AssessmentPage";
import MapPage from "./pages/MapPage";
import NotFound from "./pages/NotFound";
import LearningHistory from "./pages/LearningHistory";
import SubjectLectures from "./pages/SubjectLectures";
import AssignmentsPage from "./pages/AssignmentsPage";
import AllLectures from "./pages/AllLectures";

// Types
type UserRole = "student" | "professor" | "ngo" | null;

interface AuthContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

// Create Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const queryClient = new QueryClient();

const App = () => {
  const [userRole, setUserRole] = useLocalStorage<UserRole>("user-role", null);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage<boolean>("is-logged-in", false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ userRole, setUserRole, isLoggedIn, setIsLoggedIn }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/professor-dashboard" element={<ProfessorDashboard />} />
              <Route path="/ngo-dashboard" element={<NgoDashboard />} />
              <Route path="/lecture/:id" element={<LecturePage />} />
              <Route path="/assessment/:id" element={<AssessmentPage />} />
              <Route path="/maps" element={<MapPage />} />
              <Route path="/learning/all" element={<LearningHistory />} />
              <Route path="/learning/:subject" element={<SubjectLectures />} />
              <Route path="/learning/assignments/:subject" element={<AssignmentsPage />} />
              <Route path="/lectures/all" element={<AllLectures />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
