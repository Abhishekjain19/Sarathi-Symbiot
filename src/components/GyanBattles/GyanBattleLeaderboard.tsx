
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy,
  ArrowLeft, 
  ArrowRight,
  Calendar, 
  Users
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  topic: string;
  date: string;
}

interface GyanBattleLeaderboardProps {
  onClose: () => void;
}

// Demo leaderboard data
const demoLeaderboard: LeaderboardEntry[] = [
  { id: "1", username: "AiMaster", score: 48, topic: "Mathematics", date: "2024-05-08" },
  { id: "2", username: "QuizWhiz", score: 45, topic: "Science", date: "2024-05-08" },
  { id: "3", username: "BrainiacX", score: 42, topic: "History", date: "2024-05-08" },
  { id: "4", username: "KnowledgeSeeker", score: 40, topic: "Geography", date: "2024-05-07" },
  { id: "5", username: "CuriousLearner", score: 38, topic: "Literature", date: "2024-05-07" },
  { id: "6", username: "WisdomHunter", score: 35, topic: "Current Affairs", date: "2024-05-07" },
  { id: "7", username: "MathGenius", score: 33, topic: "Mathematics", date: "2024-05-06" },
  { id: "8", username: "ScienceGuru", score: 30, topic: "Science", date: "2024-05-06" },
  { id: "9", username: "TechNerd", score: 28, topic: "Technology", date: "2024-05-06" },
  { id: "10", username: "HistoryBuff", score: 25, topic: "History", date: "2024-05-05" },
];

export const GyanBattleLeaderboard = ({ onClose }: GyanBattleLeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(demoLeaderboard);
  const [filter, setFilter] = useState<"all" | "daily" | "weekly">("daily");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  
  // In a real app, this would fetch leaderboard data from your backend
  useEffect(() => {
    // Filter and sort data based on selected filter
    let filtered = [...demoLeaderboard];
    
    if (filter === "daily") {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(entry => entry.date === today);
    } else if (filter === "weekly") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= sevenDaysAgo;
      });
    }
    
    // Sort by score (highest first)
    filtered.sort((a, b) => b.score - a.score);
    
    setLeaderboard(filtered);
    setPage(1); // Reset to first page when filter changes
  }, [filter]);
  
  const totalPages = Math.ceil(leaderboard.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const displayedEntries = leaderboard.slice(startIndex, startIndex + itemsPerPage);
  
  // Pagination controls
  const nextPage = () => {
    setPage(current => Math.min(current + 1, totalPages));
  };
  
  const prevPage = () => {
    setPage(current => Math.max(current - 1, 1));
  };
  
  return (
    <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <Trophy className="mr-2 text-yellow-500" />
            Gyan Battle Leaderboard
          </h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All Time
            </Button>
            <Button
              variant={filter === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("weekly")}
            >
              This Week
            </Button>
            <Button
              variant={filter === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("daily")}
            >
              Today
            </Button>
          </div>
        </div>
        
        {displayedEntries.length > 0 ? (
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-xs uppercase text-sarathi-gray font-medium py-2 border-b border-sarathi-gray/20">
              <div className="col-span-1">Rank</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-2 text-center">Score</div>
              <div className="col-span-4">Topic</div>
              <div className="col-span-2 text-right">Date</div>
            </div>
            
            {displayedEntries.map((entry, index) => {
              const rank = startIndex + index + 1;
              let rankClass = "";
              
              if (rank === 1) rankClass = "text-yellow-500";
              else if (rank === 2) rankClass = "text-gray-300";
              else if (rank === 3) rankClass = "text-amber-600";
              
              return (
                <div 
                  key={entry.id}
                  className="grid grid-cols-12 items-center py-3 border-b border-sarathi-gray/10 hover:bg-sarathi-dark/30 transition-colors"
                >
                  <div className={`col-span-1 font-bold ${rankClass}`}>
                    {rank}
                  </div>
                  <div className="col-span-3 font-medium truncate">
                    {entry.username}
                  </div>
                  <div className="col-span-2 text-center font-bold">
                    {entry.score}
                  </div>
                  <div className="col-span-4 text-sm truncate">
                    {entry.topic}
                  </div>
                  <div className="col-span-2 text-right text-sarathi-gray text-sm">
                    {entry.date}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sarathi-gray">No leaderboard data available for the selected filter.</p>
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevPage}
              disabled={page === 1}
            >
              <ArrowLeft size={16} className="mr-1" /> Prev
            </Button>
            
            <span className="text-sm text-sarathi-gray">
              Page {page} of {totalPages}
            </span>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextPage}
              disabled={page === totalPages}
            >
              Next <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center space-x-2">
            <Calendar size={16} />
            <span className="text-sm text-sarathi-gray">Updated daily</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users size={16} />
            <span className="text-sm text-sarathi-gray">{leaderboard.length} players</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
