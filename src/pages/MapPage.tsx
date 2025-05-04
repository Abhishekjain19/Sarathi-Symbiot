
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info, MapPin, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";

type Location = {
  id: string;
  name: string;
  address: string;
  students: number;
  latitude: number;
  longitude: number;
}

const MapPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!profile) {
      navigate("/auth");
    }
  }, [profile, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <button 
          onClick={handleBack}
          className="flex items-center text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Learning Centers Map</h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a learning center..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-sarathi-darkCard border-sarathi-gray/30 rounded-md py-2 px-10 text-sm focus-visible:ring-secondary"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </form>

        {/* Map */}
        <div className="relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.3741832842937!2d77.6302746745262!3d12.952848715877746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae159448caefd1%3A0x9429499b69999f9a!2sNational%20Public%20School%2C%20Koramangala!5e0!3m2!1sen!2sin!4v1714460109249!5m2!1sen!2sin" 
            width="100%" 
            height="450" 
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps - Learning Centers"
            className="rounded-md"
          />
          
          {/* Location Info (Example) */}
          {selectedLocation && (
            <div className="absolute top-4 left-4 bg-sarathi-darkCard border-sarathi-gray/30 rounded-md p-4 w-64">
              <h3 className="font-medium text-lg">{selectedLocation.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
              <div className="flex items-center gap-2 mt-2">
                <User size={14} className="text-muted-foreground" />
                <span className="text-sm">{selectedLocation.students} Students</span>
              </div>
              <Button variant="secondary" size="sm" className="mt-3 w-full">
                <Info size={14} className="mr-2" /> More Info
              </Button>
            </div>
          )}
        </div>

        {/* List of Learning Centers */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Nearby Learning Centers</h2>
          {/* Replace with actual data */}
          <div className="grid gap-4">
            <div className="sarathi-card flex items-center justify-between">
              <div>
                <h3 className="font-medium">National Public School</h3>
                <p className="text-sm text-muted-foreground">Koramangala, Bangalore</p>
              </div>
              <Button variant="outline" size="sm">
                <MapPin size={14} className="mr-2" /> View on Map
              </Button>
            </div>
            <div className="sarathi-card flex items-center justify-between">
              <div>
                <h3 className="font-medium">The Brigade School</h3>
                <p className="text-sm text-muted-foreground">JP Nagar, Bangalore</p>
              </div>
              <Button variant="outline" size="sm">
                <MapPin size={14} className="mr-2" /> View on Map
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapPage;
