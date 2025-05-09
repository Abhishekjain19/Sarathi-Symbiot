import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, BookOpen, Map, BarChart, LogOut, Star, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { OfflineStatus } from "./OfflineStatus";
import { cn } from "@/lib/utils";

export const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const location = useLocation();
  
  const handleLogout = () => {
    signOut();
  };

  const getDashboardLink = () => {
    if (!profile) return "/";
    if (profile.role === "student") return "/student-dashboard";
    if (profile.role === "professor") return "/professor-dashboard";
    if (profile.role === "ngo") return "/ngo-dashboard";
    return "/";
  };

  const NavLink = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
        location.pathname === to 
          ? "bg-secondary text-secondary-foreground" 
          : "hover:bg-sarathi-gray/30"
      )}
      onClick={() => setIsMenuOpen(false)}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-10 bg-sarathi-dark border-b border-sarathi-gray/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to={getDashboardLink()} className="flex items-center">
            <span className="text-xl font-bold text-primary">Sarathi</span>
            <span className="ml-2 text-xs font-medium bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground">
              Beta
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <OfflineStatus />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-full hover:bg-sarathi-gray/30"
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[61px] bg-sarathi-dark z-50 animate-fade-in">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <NavLink to={getDashboardLink()} icon={User} label="Dashboard" />
              {profile?.role === "professor" && (
                <NavLink to="/lectures/all" icon={BookOpen} label="My Lectures" />
              )}
              <NavLink to="/maps" icon={Map} label="Find Centers" />
              <NavLink to="/assessment/1" icon={BarChart} label="Assessments" />
              <NavLink to="/gyan-battles" icon={BarChart} label="Gyan Battles" />
              <NavLink to="/srijan" icon={Star} label="Srijan" />
              <NavLink to="/gyaansetu" icon={MessageCircle} label="Gyaan Setu" />
              {profile?.role === "ngo" && (
                <NavLink to="/srijan-admin" icon={Star} label="Srijan Admin" />
              )}
            </div>
            
            <div className="mt-auto pt-6 border-t border-sarathi-gray/30">
              <button 
                onClick={handleLogout} 
                className="flex w-full items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-sarathi-gray/30"
              >
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
