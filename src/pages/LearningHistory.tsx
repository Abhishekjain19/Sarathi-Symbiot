
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/App";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const subjects = [
  {
    id: 1,
    name: "Physics",
    professor: "Dr. Sharma",
    lectureCount: 12,
    completedCount: 5,
    color: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/30",
  },
  {
    id: 2,
    name: "Mathematics",
    professor: "Dr. Patel",
    lectureCount: 15,
    completedCount: 8,
    color: "from-purple-500/20 to-purple-600/20",
    borderColor: "border-purple-500/30",
  },
  {
    id: 3,
    name: "Chemistry",
    professor: "Prof. Verma",
    lectureCount: 10,
    completedCount: 3,
    color: "from-green-500/20 to-green-600/20",
    borderColor: "border-green-500/30",
  },
];

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
          
          <TabsContent value="lectures" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Link key={subject.id} to={`/learning/${subject.name.toLowerCase()}`}>
                <Card className={`bg-gradient-to-br ${subject.color} ${subject.borderColor} p-6 hover:scale-105 transition-transform duration-200 cursor-pointer`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/10 rounded-full p-2">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">{subject.professor}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{subject.lectureCount} lectures</span>
                    <span className="text-green-400">{subject.completedCount} completed</span>
                  </div>
                </Card>
              </Link>
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
