
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

// Mock data - replace with actual data later
const mockLectures = {
  physics: [
    { id: 1, title: "Introduction to Mechanics", professor: "Dr. Sharma", duration: "45 minutes", progress: 30 },
    { id: 2, title: "Laws of Motion", professor: "Dr. Sharma", duration: "50 minutes", progress: 0 },
    { id: 3, title: "Work and Energy", professor: "Dr. Sharma", duration: "40 minutes", progress: 75 },
  ],
  mathematics: [
    { id: 1, title: "Basic Calculus", professor: "Dr. Patel", duration: "55 minutes", progress: 100 },
    { id: 2, title: "Differentiation", professor: "Dr. Patel", duration: "45 minutes", progress: 60 },
  ],
  chemistry: [
    { id: 1, title: "Atomic Structure", professor: "Prof. Verma", duration: "40 minutes", progress: 0 },
    { id: 2, title: "Chemical Bonding", professor: "Prof. Verma", duration: "50 minutes", progress: 25 },
  ],
};

const SubjectLectures = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  
  if (!subject || !mockLectures[subject as keyof typeof mockLectures]) {
    navigate("/learning/all");
    return null;
  }

  const lectures = mockLectures[subject as keyof typeof mockLectures];

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 capitalize">{subject} Lectures</h1>
      
      <div className="space-y-4">
        {lectures.map((lecture) => (
          <Card key={lecture.id} className="bg-sarathi-darkCard border-sarathi-gray/30 p-4">
            <h3 className="font-medium">{lecture.title}</h3>
            <p className="text-sm text-muted-foreground">{lecture.professor}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} />
                {lecture.duration}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                lecture.progress === 0
                  ? "bg-blue-600/20 text-blue-500"
                  : lecture.progress === 100
                  ? "bg-green-600/20 text-green-500"
                  : "bg-yellow-600/20 text-yellow-500"
              }`}>
                {lecture.progress === 0
                  ? "Not Started"
                  : lecture.progress === 100
                  ? "Completed"
                  : `${lecture.progress}% Complete`}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default SubjectLectures;
