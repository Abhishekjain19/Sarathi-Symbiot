
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

// Mock data for assignments - replace with actual data later
const mockAssignments = {
  physics: [
    { id: 1, title: "Mechanics Problem Set", dueDate: "2024-05-15", status: 0 },
    { id: 2, title: "Motion Equations", dueDate: "2024-05-20", status: 50 },
    { id: 3, title: "Energy Conservation", dueDate: "2024-05-25", status: 100 },
  ],
  mathematics: [
    { id: 1, title: "Calculus Worksheet", dueDate: "2024-05-16", status: 100 },
    { id: 2, title: "Differential Equations", dueDate: "2024-05-22", status: 25 },
  ],
  chemistry: [
    { id: 1, title: "Atomic Structure Assignment", dueDate: "2024-05-18", status: 0 },
    { id: 2, title: "Chemical Bonding Report", dueDate: "2024-05-23", status: 75 },
  ],
};

const Assignments = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  
  if (!subject || !mockAssignments[subject as keyof typeof mockAssignments]) {
    navigate("/learning/all");
    return null;
  }

  const assignments = mockAssignments[subject as keyof typeof mockAssignments];

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 capitalize">{subject} Assignments</h1>
      
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="bg-sarathi-darkCard border-sarathi-gray/30 p-4">
            <h3 className="font-medium">{assignment.title}</h3>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText size={12} />
                Due: {assignment.dueDate}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                assignment.status === 0
                  ? "bg-blue-600/20 text-blue-500"
                  : assignment.status === 100
                  ? "bg-green-600/20 text-green-500"
                  : "bg-yellow-600/20 text-yellow-500"
              }`}>
                {assignment.status === 0
                  ? "Not Started"
                  : assignment.status === 100
                  ? "Completed"
                  : `${assignment.status}% Complete`}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default Assignments;
