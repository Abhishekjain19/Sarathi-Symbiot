
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserRound, GraduationCap, Users } from "lucide-react";
import { useAuth } from "@/App";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    icon: Icon,
    delay 
  }: { 
    role: "student" | "professor" | "ngo";
    title: string;
    description: string;
    icon: React.ElementType;
    delay: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden backdrop-blur-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] group",
          selectedRole === role 
            ? "border-secondary bg-secondary/10 shadow-lg shadow-secondary/20" 
            : "border-sarathi-gray/30 bg-sarathi-darkCard/60 hover:border-primary/50"
        )}
        onClick={() => setSelectedRole(role)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative p-6 flex flex-col gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            selectedRole === role ? "bg-secondary text-white" : "bg-sarathi-gray/30"
          )}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sarathi-dark via-sarathi-dark/95 to-sarathi-dark text-white">
      <section className="relative flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-1"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl transform -translate-y-1/2" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-primary/80 to-secondary bg-clip-text text-transparent">
            Navigator
          </h1>
          <p className="text-2xl md:text-3xl font-light mb-8 tracking-wide">
            Bridging the Educational Gap
          </p>
          <p className="text-lg max-w-md mx-auto text-muted-foreground">
            Connecting retired professors from premier institutions with students in rural India.
          </p>
        </motion.div>
      </section>

      <section className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-medium mb-8 text-center"
        >
          Continue as
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <RoleCard 
            role="student"
            title="Student"
            description="Access lectures, take assessments, and track your progress"
            icon={GraduationCap}
            delay={0.4}
          />
          
          <RoleCard 
            role="professor"
            title="Professor"
            description="Upload lectures, schedule classes, and monitor student performance"
            icon={UserRound}
            delay={0.5}
          />
          
          <RoleCard 
            role="ngo"
            title="NGO Admin"
            description="Manage resources, monitor centers, and coordinate educational efforts"
            icon={Users}
            delay={0.6}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 max-w-md mx-auto"
        >
          <Button 
            className={cn(
              "w-full h-12 text-lg transition-all duration-300",
              selectedRole 
                ? "bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20" 
                : "bg-sarathi-gray/30 hover:bg-sarathi-gray/40"
            )}
            onClick={handleLogin}
            disabled={!selectedRole}
          >
            Sign In with Google
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
