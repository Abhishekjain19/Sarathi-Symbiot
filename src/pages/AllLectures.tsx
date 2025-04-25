
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Play, Circle, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/App";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - Replace with actual data later
const allLectures = [
  {
    id: 1,
    title: "Introduction to Physics",
    views: 56,
    date: "22 Apr",
    thumbnail: "https://placehold.co/400x225/1a237e/ffffff?text=Physics",
    isLive: true,
    grade: "10th",
  },
  {
    id: 2,
    title: "Mathematics: Calculus Basics",
    views: 42,
    date: "20 Apr",
    thumbnail: "https://placehold.co/400x225/26a69a/ffffff?text=Mathematics",
    isLive: false,
    grade: "12th",
  },
  {
    id: 3,
    title: "Chemistry Fundamentals",
    views: 24,
    date: "15 Apr",
    thumbnail: "https://placehold.co/400x225/1a237e/ffffff?text=Chemistry",
    isLive: true,
    grade: "9th",
  },
  {
    id: 4,
    title: "Advanced Mechanics",
    views: 31,
    date: "10 Apr",
    thumbnail: "https://placehold.co/400x225/1a237e/ffffff?text=Physics",
    isLive: false,
    grade: "12th",
  },
  {
    id: 5,
    title: "Organic Chemistry",
    views: 28,
    date: "5 Apr",
    thumbnail: "https://placehold.co/400x225/1a237e/ffffff?text=Chemistry",
    isLive: false,
    grade: "11th",
  }
];

const grades = [
  "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"
];

const AllLectures = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<string>("");

  useEffect(() => {
    if (!isLoggedIn || userRole !== "professor") {
      navigate("/");
    }
  }, [isLoggedIn, navigate, userRole]);

  const filteredLectures = selectedGrade
    ? allLectures.filter(lecture => lecture.grade === selectedGrade)
    : allLectures;

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">All Uploaded Lectures</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-muted-foreground" />
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade} Grade
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          {filteredLectures.map((lecture) => (
            <Card key={lecture.id} className="bg-sarathi-darkCard border-sarathi-gray/30 p-4">
              <div className="flex gap-4">
                <div className="h-16 w-28 overflow-hidden rounded-lg flex-shrink-0 relative">
                  <img 
                    src={lecture.thumbnail} 
                    alt={lecture.title} 
                    className="h-full w-full object-cover"
                  />
                  {lecture.isLive && (
                    <div className="absolute top-1 left-1">
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <Circle size={8} className="fill-current animate-pulse" />
                        LIVE
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium line-clamp-1">{lecture.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {lecture.grade} Grade
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {lecture.isLive ? "Streaming now" : `Uploaded on ${lecture.date}`}
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
