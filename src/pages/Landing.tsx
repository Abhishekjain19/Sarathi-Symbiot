
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRound, GraduationCap, Users } from "lucide-react";
import { useAuth } from "@/App";
import { cn } from "@/lib/utils";

const Landing = () => {
  const navigate = useNavigate();
  const { setUserRole, setIsLoggedIn } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"student" | "professor" | "ngo" | null>(null);

  const handleLogin = () => {
    if (!selectedRole) return;
    
    setUserRole(selectedRole);
    setIsLoggedIn(true);
    
    if (selectedRole === "student") {
      navigate("/student-dashboard");
    } else if (selectedRole === "professor") {
      navigate("/professor-dashboard");
    } else {
      navigate("/ngo-dashboard");
    }
  };

  const RoleCard = ({ 
    role, 
    title, 
    description, 
    icon: Icon 
  }: { 
    role: "student" | "professor" | "ngo"; 
    title: string; 
    description: string; 
    icon: React.ElementType;
  }) => (
    <Card 
      className={cn(
        "border-2 cursor-pointer transition-all",
        selectedRole === role 
          ? "border-secondary bg-secondary/10" 
          : "border-sarathi-gray/30 bg-sarathi-darkCard hover:border-primary/50"
      )}
      onClick={() => setSelectedRole(role)}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className={cn(
          "p-2 rounded-full",
          selectedRole === role ? "bg-secondary text-white" : "bg-sarathi-gray/30"
        )}>
          <Icon size={24} />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-sarathi-dark text-white">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent z-0"></div>
        <div className="relative z-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="text-primary">सारथी</span>
          </h1>
          <p className="text-2xl md:text-3xl font-light mb-8">Bridging the Educational Gap</p>
          <p className="text-lg max-w-md mx-auto text-muted-foreground">
            Connecting retired professors from premier institutions with students in rural India.
          </p>
        </div>
      </section>

      {/* Role Selection */}
      <section className="flex-1 container max-w-md mx-auto px-4 py-8">
        <h2 className="text-xl font-medium mb-6 text-center">Continue as</h2>
        
        <div className="flex flex-col gap-4">
          <RoleCard 
            role="student"
            title="Student"
            description="Access lectures, take assessments, and track your progress"
            icon={GraduationCap}
          />
          
          <RoleCard 
            role="professor"
            title="Professor"
            description="Upload lectures, schedule classes, and monitor student performance"
            icon={UserRound}
          />
          
          <RoleCard 
            role="ngo"
            title="NGO Admin"
            description="Manage resources, monitor centers, and coordinate educational efforts"
            icon={Users}
          />
        </div>

        <div className="mt-8">
          <Button 
            className="w-full sarathi-button" 
            onClick={handleLogin}
            disabled={!selectedRole}
          >
            Sign In with Google
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
