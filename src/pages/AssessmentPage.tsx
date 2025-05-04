import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";

const subjects = ["Physics", "Chemistry", "Mathematics", "Biology", "English"];
const grades = ["4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

const AssessmentPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>("Physics");
  const [selectedGrade, setSelectedGrade] = useState<string>("4th");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container max-w-4xl mx-auto px-4 py-6 pb-20">
        <button 
          onClick={handleBack}
          className="flex items-center text-sm text-muted-foreground mb-4"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Assessments</h1>
          {userRole === "professor" && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate("/create-assignment")}
              >
                <Plus size={16} />
                Create Assignment
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={() => navigate("/create-test")}
              >
                <Plus size={16} />
                Create Test
              </Button>
            </div>
          )}
        </div>

        {userRole === "professor" && (
          <Card className="bg-sarathi-darkCard border-sarathi-gray/30 mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Select Grade
                  </label>
                  <Select 
                    value={selectedGrade}
                    onValueChange={setSelectedGrade}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Select Subject
                  </label>
                  <Select 
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {userRole === "professor" 
                  ? "Select a grade and subject to view or create assessments"
                  : "No assessments available for your grade at the moment"}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AssessmentPage;
