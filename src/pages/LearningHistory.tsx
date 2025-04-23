
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/App";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const LearningHistory = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || userRole !== "student") {
      navigate("/");
    }
  }, [isLoggedIn, navigate, userRole]);

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Learning History</h1>
        
        <Tabs defaultValue="lectures" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="lectures">Lectures</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lectures" className="space-y-4">
            {/* Mock data - replace with actual data later */}
            {Array.from({ length: 5 }).map((_, idx) => (
              <Card key={idx} className="bg-sarathi-darkCard border-sarathi-gray/30 p-4">
                <h3 className="font-medium">Introduction to Physics {idx + 1}</h3>
                <p className="text-sm text-muted-foreground">Dr. Sharma</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">45 minutes</span>
                  <span className="text-xs bg-green-600/20 text-green-500 px-2 py-1 rounded">
                    Completed
                  </span>
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-4">
            <p className="text-center text-muted-foreground py-8">
              No assignments yet
            </p>
          </TabsContent>
          
          <TabsContent value="tests" className="space-y-4">
            <p className="text-center text-muted-foreground py-8">
              No tests yet
            </p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LearningHistory;
