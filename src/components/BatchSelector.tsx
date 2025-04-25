
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const grades = ["4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

interface BatchSelectorProps {
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
}

export const BatchSelector = ({ selectedGrade, onGradeChange }: BatchSelectorProps) => {
  return (
    <div className="flex items-center gap-3 mb-6 bg-sarathi-darkCard p-4 rounded-lg border border-sarathi-gray/30">
      <span className="text-sm text-muted-foreground">Current Grade:</span>
      <Select value={selectedGrade} onValueChange={onGradeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select grade" />
        </SelectTrigger>
        <SelectContent>
          {grades.map((grade) => (
            <SelectItem key={grade} value={grade}>
              {grade} Grade
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
