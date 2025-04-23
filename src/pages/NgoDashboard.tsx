
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, School, Wifi, Users, Laptop, Battery, Map as MapIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/App";

// Mock data
const centerStats = [
  { label: "Active Centers", value: "5", icon: MapPin },
  { label: "Partnered Schools", value: "12", icon: School },
  { label: "Internet Hubs", value: "8", icon: Wifi },
];

const centers = [
  {
    id: 1,
    name: "Anandpur Center",
    location: "Anandpur Village",
    students: 42,
    batteryLevel: 78,
    internetStatus: "Online",
  },
  {
    id: 2,
    name: "Surajpur Hub",
    location: "Surajpur District",
    students: 36,
    batteryLevel: 45,
    internetStatus: "Offline",
  },
  {
    id: 3,
    name: "Krishnapur School",
    location: "Krishnapur",
    students: 65,
    batteryLevel: 92,
    internetStatus: "Online",
  },
];

const resourceUtilization = [
  { name: "Tablets", available: 48, used: 36 },
  { name: "Power Banks", available: 30, used: 22 },
  { name: "Offline Content", available: 200, used: 145 }
];

const NgoDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || userRole !== "ngo") {
      navigate("/");
    }
  }, [isLoggedIn, navigate, userRole]);

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">NGO Dashboard</h1>
          <Link to="/maps">
            <Button className="sarathi-button">
              <MapIcon size={18} className="mr-2" /> View Map
            </Button>
          </Link>
        </div>
        
        {/* Center Stats */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            {centerStats.map((stat, idx) => (
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
        
        {/* Active Centers */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Active Centers</h2>
            <Button variant="outline" size="sm">Add Center</Button>
          </div>
          
          <div className="grid gap-4">
            {centers.map((center) => (
              <Card key={center.id} className="bg-sarathi-darkCard border-sarathi-gray/30">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">{center.name}</CardTitle>
                    <span className={center.internetStatus === "Online" ? "online-badge" : "offline-badge"}>
                      {center.internetStatus}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <MapPin size={12} className="mr-1" />
                    {center.location}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <Users size={14} className="mr-1" />
                      <span>{center.students} students</span>
                    </div>
                    <div className="flex items-center">
                      <Battery size={14} className="mr-1" />
                      <span>{center.batteryLevel}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        {/* Resource Utilization */}
        <section>
          <h2 className="text-lg font-medium mb-4">Resource Utilization</h2>
          <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
            <CardContent className="pt-6">
              {resourceUtilization.map((resource, idx) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <Laptop size={14} className="mr-2" />
                      <span>{resource.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {resource.used}/{resource.available}
                    </span>
                  </div>
                  <Progress value={(resource.used / resource.available) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default NgoDashboard;
