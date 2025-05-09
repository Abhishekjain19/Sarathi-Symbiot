
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

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
import SrijanIdeaHub from "./pages/SrijanIdeaHub";
import SrijanAdmin from "./pages/SrijanAdmin";
import GyaanSetuPage from "./pages/GyaanSetuPage";
import GyanBattlesPage from "./pages/GyanBattlesPage";
import Auth from "./pages/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes */}
              <Route 
                path="/student-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/professor-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={["professor"]}>
                    <ProfessorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ngo-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={["ngo"]}>
                    <NgoDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/lecture/:id" 
                element={
                  <ProtectedRoute allowedRoles={["student", "professor", "ngo"]}>
                    <LecturePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/assessment/:id" 
                element={
                  <ProtectedRoute allowedRoles={["student", "professor", "ngo"]}>
                    <AssessmentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/maps" 
                element={
                  <ProtectedRoute allowedRoles={["student", "professor", "ngo"]}>
                    <MapPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/learning/all" 
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <LearningHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/learning/:subject" 
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SubjectLectures />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/learning/assignments/:subject" 
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <AssignmentsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/lectures/all" 
                element={
                  <ProtectedRoute allowedRoles={["professor", "ngo"]}>
                    <AllLectures />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/srijan" 
                element={
                  <ProtectedRoute allowedRoles={["student", "professor", "ngo"]}>
                    <SrijanIdeaHub />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/srijan-admin" 
                element={
                  <ProtectedRoute allowedRoles={["ngo"]}>
                    <SrijanAdmin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gyaansetu" 
                element={
                  <ProtectedRoute allowedRoles={["student", "professor", "ngo"]}>
                    <GyaanSetuPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gyan-battles" 
                element={
                  <ProtectedRoute allowedRoles={["student", "professor", "ngo"]}>
                    <GyanBattlesPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
