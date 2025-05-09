
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCw } from "lucide-react";

interface GyanWheelProps {
  onTopicSelect: (topic: string) => void;
}

const topics = [
  "Mathematics", "Science", "History", "Geography", 
  "Literature", "Current Affairs", "Technology", "General Knowledge"
];

export const GyanWheel = ({ onTopicSelect }: GyanWheelProps) => {
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [rotation, setRotation] = useState(0);

  const spinWheel = () => {
    if (spinning) return;
    
    setSpinning(true);
    
    // Random number of full rotations (3-5 complete spins) plus the final position
    const spins = 3 + Math.floor(Math.random() * 3);
    const randomIndex = Math.floor(Math.random() * topics.length);
    const finalRotation = spins * 360 + (randomIndex * (360 / topics.length));
    
    setRotation(finalRotation);
    
    // Wait for animation to complete
    setTimeout(() => {
      setSelectedIndex(randomIndex);
      setSpinning(false);
      onTopicSelect(topics[randomIndex]);
    }, 3000); // Match this with the CSS transition duration
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative w-64 h-64">
        {/* Wheel */}
        <div 
          className="absolute w-full h-full rounded-full overflow-hidden border-4 border-primary transition-transform duration-3000 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {topics.map((topic, index) => {
            const angle = (index * 360) / topics.length;
            const bgColorClass = index % 2 === 0 ? "bg-blue-600" : "bg-purple-600";
            return (
              <div
                key={topic}
                className={`absolute w-full h-full origin-bottom-left ${bgColorClass}`}
                style={{
                  transform: `rotate(${angle}deg) skewY(${90 - (360 / topics.length)}deg)`,
                  transformOrigin: "0 100%",
                }}
              >
                <div 
                  className="absolute bottom-[50%] left-[50%] translate-x-[-50%] w-full text-center text-white text-xs font-medium"
                  style={{
                    transform: `rotate(${(360 / topics.length) / 2}deg)`,
                  }}
                >
                  {topic}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center point */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-white z-10"></div>
        </div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 
                      border-l-[10px] border-l-transparent
                      border-b-[20px] border-b-red-500
                      border-r-[10px] border-r-transparent z-20">
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <Button 
          onClick={spinWheel} 
          disabled={spinning}
          size="lg"
          className="flex items-center space-x-2"
        >
          {spinning ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Spinning...</span>
            </>
          ) : (
            <>
              <RotateCw />
              <span>Spin the Wheel</span>
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-sarathi-gray mb-2">Or select a topic directly:</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {topics.map(topic => (
              <Button 
                key={topic}
                variant="outline"
                size="sm"
                onClick={() => onTopicSelect(topic)}
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
