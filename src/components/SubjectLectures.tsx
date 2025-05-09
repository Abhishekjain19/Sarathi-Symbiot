import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

// Fallback mock data if database fetch fails
const mockLectures = {
  physics: [
    { id: "1", title: "Multiplication of Numbers", professor: "Dr. Sharma", duration: "45 minutes", progress: 30, subject: "physics", grade: "10th", file_url: "", thumbnail_url: "" },
    { id: "2", title: "Laws of Motion", professor: "Dr. Sharma", duration: "50 minutes", progress: 0, subject: "physics", grade: "10th", file_url: "", thumbnail_url: "" },
    { id: "3", title: "Work and Energy", professor: "Dr. Sharma", duration: "40 minutes", progress: 75, subject: "physics", grade: "10th", file_url: "", thumbnail_url: "" },
  ],
  mathematics: [
    { id: "1", title: "Basic Calculus", professor: "Dr. Patel", duration: "55 minutes", progress: 100, subject: "mathematics", grade: "10th", file_url: "", thumbnail_url: "" },
    { id: "2", title: "Differentiation", professor: "Dr. Patel", duration: "45 minutes", progress: 60, subject: "mathematics", grade: "10th", file_url: "", thumbnail_url: "" },
  ],
  chemistry: [
    { id: "1", title: "Atomic Structure", professor: "Prof. Verma", duration: "40 minutes", progress: 0, subject: "chemistry", grade: "10th", file_url: "", thumbnail_url: "" },
    { id: "2", title: "Chemical Bonding", professor: "Prof. Verma", duration: "50 minutes", progress: 25, subject: "chemistry", grade: "10th", file_url: "", thumbnail_url: "" },
  ],
};

interface Lecture {
  id: string;
  title: string;
  professor?: string;
  duration: string;
  progress: number;
  subject: string;
  grade: string;
  file_url?: string;
  thumbnail_url?: string;
}

const SubjectLectures = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        if (!subject) return;
        
        // Get student grade from profile
        const studentGrade = profile?.grade || "4th";
        
        // Fetch lectures from Supabase for this subject and grade
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('subject', subject)
          .eq('grade', studentGrade);
        
        if (error) {
          console.error("Error fetching lectures:", error);
          toast({
            title: "Error loading lectures",
            description: "Using demonstration content instead.",
            variant: "destructive",
          });
          
          // Fall back to mock data if database fetch fails
          if (subject in mockLectures) {
            setLectures(mockLectures[subject as keyof typeof mockLectures]);
          }
          return;
        }
        
        // Transform database data to match our component needs
        const formattedLectures = data.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          professor: lesson.uploaded_by ? "Prof. " + lesson.uploaded_by : "Unknown Professor",
          duration: lesson.duration ? `${lesson.duration} minutes` : "Unknown duration",
          progress: 0, // We'll need to track this separately
          subject: lesson.subject,
          grade: lesson.grade,
          file_url: lesson.file_url,
          thumbnail_url: lesson.thumbnail_url
        }));
        
        setLectures(formattedLectures.length > 0 ? formattedLectures : 
          mockLectures[subject as keyof typeof mockLectures] || []);
      } catch (error) {
        console.error("Error in lecture fetch:", error);
        // Fall back to mock data
        if (subject && subject in mockLectures) {
          setLectures(mockLectures[subject as keyof typeof mockLectures]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchLectures();
  }, [subject, profile, toast]);

  if (!subject || (!loading && lectures.length === 0)) {
    navigate("/learning/all");
    return null;
  }

  const handleLectureClick = (lectureId: string | number) => {
    navigate(`/lecture/${lectureId}`);
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 capitalize">{subject} Lectures</h1>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="bg-sarathi-darkCard border-sarathi-gray/30 p-4 animate-pulse">
              <div className="h-5 bg-sarathi-gray/20 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-sarathi-gray/20 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-sarathi-gray/20 rounded w-1/4"></div>
                <div className="h-5 bg-sarathi-gray/20 rounded w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {lectures.map((lecture) => (
            <Card 
              key={lecture.id} 
              className="bg-sarathi-darkCard border-sarathi-gray/30 p-4 cursor-pointer hover:bg-sarathi-gray/10 transition-colors"
              onClick={() => handleLectureClick(lecture.id)}
            >
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
      )}
    </main>
  );
};

export default SubjectLectures;
