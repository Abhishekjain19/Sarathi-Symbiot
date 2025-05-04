import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BarChart3, BookOpen, Clock, Users, PlusCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";

// Mock data
const professorStats = [
  { label: "Total Lectures", value: "25", icon: BookOpen },
  { label: "Students Impacted", value: "450", icon: Users },
  { label: "Avg. Watch Time", value: "35 min", icon: Clock },
];

const recentUploads = [
  {
    id: 1,
    title: "Advanced Calculus",
    views: 56,
    date: "22 Apr",
    progress: 80,
    thumbnail: "https://placehold.co/400x225/26a69a/ffffff?text=Calculus",
  },
  {
    id: 2,
    title: "Quantum Mechanics",
    views: 42,
    date: "20 Apr",
    progress: 60,
    thumbnail: "https://placehold.co/400x225/1a237e/ffffff?text=Quantum",
  },
  {
    id: 3,
    title: "Organic Chemistry",
    views: 24,
    date: "15 Apr",
    progress: 25,
    thumbnail: "https://placehold.co/400x225/1a237e/ffffff?text=Organic",
  },
];

const ProfessorDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || userRole !== "professor") {
      navigate("/");
    }
  }, [isLoggedIn, navigate, userRole]);

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Professor Dashboard</h1>
          <Button 
            className="sarathi-button"
            onClick={() => navigate("/create-lecture")}
          >
            <PlusCircle size={18} className="mr-2" /> Upload Lecture
          </Button>
        </div>
        
        {/* Professor Stats */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Your Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            {professorStats.map((stat, idx) => (
              <Card key={idx} className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-primary/20 text-primary p-2 rounded-full mb-2">
                      <stat.icon size={20} />
                    </div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Recent Uploads */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Recent Uploads</h2>
            <Link to="/lectures/all" className="text-sm text-secondary">
              See all
            </Link>
          </div>
          
          <div className="grid gap-4">
            {recentUploads.map((lecture) => (
              <Card key={lecture.id} className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{lecture.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">Uploaded on {lecture.date}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <BookOpen size={14} className="mr-1" />
                      <span>{lecture.views} views</span>
                    </div>
                    <div className="flex items-center">
                      <BarChart3 size={14} className="mr-1" />
                      <span>{lecture.progress}% watched</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={lecture.progress} className="h-2" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfessorDashboard;
