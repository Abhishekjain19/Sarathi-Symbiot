import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Play, BarChart3, Download, Clock, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/App";
import { BatchSelector } from "@/components/BatchSelector";

// Mock data with grade information
const recentLectures = [
  {
    id: 1,
    title: "Introduction to Physics",
    professor: "Dr. Sharma",
    duration: "45 min",
    progress: 30,
    thumbnail: "https://placehold.co/400x225/1a237e/ffffff?text=Physics",
    isDownloaded: false,
    grade: "4th",
  },
  {
    id: 2,
    title: "Mathematics: Calculus Basics",
    professor: "Dr. Patel",
    duration: "60 min",
    progress: 75,
    thumbnail: "https://placehold.co/400x225/26a69a/ffffff?text=Mathematics",
    isDownloaded: true,
    grade: "5th",
  },
  {
    id: 3,
    title: "Chemistry Fundamentals",
    professor: "Prof. Verma",
    duration: "50 min",
    progress: 0,
    thumbnail: "https://placehold.co/400x225/1a237e/ffffff?text=Chemistry",
    isDownloaded: false,
    grade: "4th",
  },
];

const upcomingTests = [
  {
    id: 1,
    title: "Physics Weekly Test",
    date: "Tomorrow",
    time: "10:00 AM",
    duration: "30 min",
  },
  {
    id: 2,
    title: "Mathematics Quiz",
    date: "25 Apr",
    time: "3:00 PM",
    duration: "45 min",
  },
];

const progressStats = [
  { label: "Watch Time", value: "12h 30m", icon: Clock },
  { label: "Completed Tests", value: "8/10", icon: BarChart3 },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<string>("4th");

  useEffect(() => {
    if (!isLoggedIn || userRole !== "student") {
      navigate("/");
    }
  }, [isLoggedIn, navigate, userRole]);

  // Filter lectures based on selected grade
  const filteredLectures = recentLectures.filter(
    (lecture) => lecture.grade === selectedGrade
  );

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold mb-6">Welcome, Student</h1>
        <BatchSelector 
          selectedGrade={selectedGrade} 
          onGradeChange={setSelectedGrade}
        />
        
        {/* Continue Learning */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Continue Learning</h2>
            <Link 
              to="/learning/all" 
              className="text-sm text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1"
            >
              See all <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid gap-4">
            {filteredLectures.map((lecture) => (
              <div key={lecture.id} className="sarathi-card">
                <div className="flex gap-4">
                  <div className="relative h-20 w-32 overflow-hidden rounded-lg">
                    <img 
                      src={lecture.thumbnail} 
                      alt={lecture.title} 
                      className="h-full w-full object-cover"
                    />
                    {lecture.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 text-[10px]">
                        {lecture.progress}% completed
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-medium line-clamp-1">{lecture.title}</h3>
                    <p className="text-sm text-muted-foreground">{lecture.professor}</p>
                    <p className="text-xs flex items-center mt-1 text-muted-foreground">
                      <Clock size={12} className="mr-1" />
                      {lecture.duration}
                    </p>
                    
                    <div className="mt-2">
                      <Progress value={lecture.progress} className="h-1" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-3">
                  {!lecture.isDownloaded ? (
                    <Button variant="outline" size="sm" className="text-xs">
                      <Download size={14} className="mr-1" /> Download
                    </Button>
                  ) : (
                    <span className="text-xs bg-green-600/20 text-green-500 px-2 py-1 rounded flex items-center">
                      Available Offline
                    </span>
                  )}
                  
                  <Link to={`/lecture/${lecture.id}`}>
                    <Button size="sm" className="text-xs bg-primary">
                      <Play size={14} className="mr-1" /> Continue
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Your Progress */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Your Progress</h2>
          <div className="grid grid-cols-2 gap-4">
            {progressStats.map((stat, idx) => (
              <Card key={idx} className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                    </div>
                    <div className="bg-primary/20 text-primary p-2 rounded-full">
                      <stat.icon size={20} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Upcoming Tests */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Upcoming Tests</h2>
            <Link to="/assessment/1" className="text-sm text-secondary">
              See all
            </Link>
          </div>
          
          <div className="grid gap-4">
            {upcomingTests.map((test) => (
              <Card key={test.id} className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{test.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between text-sm">
                    <div className="text-muted-foreground">
                      {test.date} • {test.time}
                    </div>
                    <div className="text-muted-foreground">
                      {test.duration}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Set Reminder
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
