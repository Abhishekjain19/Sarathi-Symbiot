
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/App";
import { Link } from "react-router-dom";

// Mock data - Replace with actual data later
const allLectures = [
  {
    id: 1,
    title: "Introduction to Physics",
    views: 56,
    date: "22 Apr",
    thumbnail: "https://placehold.co/400x225/1a237e/ffffff?text=Physics",
  },
  {
    id: 2,
    title: "Mathematics: Calculus Basics",
    views: 42,
    date: "20 Apr",
    thumbnail: "https://placehold.co/400x225/26a69a/ffffff?text=Mathematics",
  },
  {
    id: 3,
    title: "Chemistry Fundamentals",
    views: 24,
    date: "15 Apr",
    thumbnail: "https://placehold.co/400x225/1a237e/ffffff?text=Chemistry",
  },
  {
    id: 4,
    title: "Advanced Mechanics",
    views: 31,
    date: "10 Apr",
    thumbnail: "https://placehold.co/400x225/1a237e/ffffff?text=Physics",
  },
  {
    id: 5,
    title: "Organic Chemistry",
    views: 28,
    date: "5 Apr",
    thumbnail: "https://placehold.co/400x225/1a237e/ffffff?text=Chemistry",
  }
];

const AllLectures = () => {
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
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">All Uploaded Lectures</h1>
        <div className="grid gap-4">
          {allLectures.map((lecture) => (
            <Card key={lecture.id} className="bg-sarathi-darkCard border-sarathi-gray/30 p-4">
              <div className="flex gap-4">
                <div className="h-16 w-28 overflow-hidden rounded-lg flex-shrink-0">
                  <img 
                    src={lecture.thumbnail} 
                    alt={lecture.title} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium line-clamp-1">{lecture.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      Uploaded on {lecture.date}
                    </p>
                    <p className="text-xs flex items-center">
                      <Users size={12} className="mr-1" />
                      {lecture.views} views
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Progress 
                      value={Math.min(lecture.views, 100)} 
                      className="h-1 flex-grow"
                    />
                    <Link to={`/lecture/${lecture.id}`}>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Play size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AllLectures;
