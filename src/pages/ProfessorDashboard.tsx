
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload, Play, Calendar, Users, BarChart3, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/App";

// Mock data
const uploadedLectures = [
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
];

const studentStats = [
  { label: "Total Students", value: "128", icon: Users },
  { label: "Avg. Watch Time", value: "32 min", icon: Clock },
  { label: "Test Completion", value: "76%", icon: BarChart3 },
];

const scheduleItems = [
  {
    id: 1,
    title: "Live Session: Physics Q&A",
    date: "Tomorrow",
    time: "3:00 PM",
    attendees: 24,
  },
  {
    id: 2,
    title: "Doubt Clearing - Mathematics",
    date: "26 Apr",
    time: "5:00 PM",
    attendees: 12,
  },
];

const ProfessorDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const [showMap, setShowMap] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoggedIn || userRole !== "professor") {
      navigate("/");
    }
  }, [isLoggedIn, navigate, userRole]);

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Professor Dashboard</h1>
          <Button className="sarathi-button">
            <Upload size={18} className="mr-2" /> Upload Lecture
          </Button>
        </div>
        
        {/* Student Stats */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Student Engagement</h2>
          <div className="grid grid-cols-3 gap-4">
            {studentStats.map((stat, idx) => (
              <Card key={idx} className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-primary/20 text-primary p-2 rounded-full mb-2">
                      <stat.icon size={20} />
                    </div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Teaching Centers Map */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Teaching Centers</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setShowMap(!showMap)}
            >
              <MapPin size={14} />
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
          </div>
          
          {showMap && (
            <Card className="bg-sarathi-darkCard border-sarathi-gray/30 overflow-hidden mb-4">
              <CardContent className="p-0">
                <div className="w-full h-[450px]">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d622.7072322075145!2d77.521654!3d13.0116666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m3!3m2!1d13.0116945!2d77.5220557!4m3!3m2!1d13.0119921!2d77.5221362!4m3!3m2!1d13.0117565!2d77.5214722!5e0!3m2!1sen!2sin!4v1714459532005!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps - Teaching Centers"
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
              <CardFooter className="p-3">
                <div className="flex justify-between items-center w-full">
                  <p className="text-sm text-muted-foreground">3 Learning Centers where you teach</p>
                  <Button 
                    size="sm" 
                    className="text-xs"
                    onClick={() => navigate('/maps')}
                  >
                    View Full Map
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </section>
        
        {/* Uploaded Lectures */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Your Lectures</h2>
            <Link to="/lectures/all" className="text-sm text-secondary">
              See all
            </Link>
          </div>
          
          <div className="grid gap-4">
            {uploadedLectures.map((lecture) => (
              <div key={lecture.id} className="sarathi-card">
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
              </div>
            ))}
          </div>
        </section>
        
        {/* Upcoming Schedule */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Upcoming Schedule</h2>
            <Button variant="outline" size="sm" className="text-sm">
              <Calendar size={14} className="mr-1" /> Schedule New
            </Button>
          </div>
          
          <div className="grid gap-4">
            {scheduleItems.map((item) => (
              <Card key={item.id} className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <div className="text-muted-foreground">
                      {item.date} • {item.time}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users size={14} className="mr-1" />
                      {item.attendees} attending
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfessorDashboard;
