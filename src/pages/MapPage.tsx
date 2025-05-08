
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info, MapPin, User, Search, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import MapComponent from "@/components/MapComponent";

type Location = {
  id: string;
  name: string;
  address: string;
  students: number;
  latitude: number;
  longitude: number;
}

const OPENROUTE_API_KEY = "5b3ce3597851110001cf6248a6be720229f7485caea62c80084d8f4f";

const MapPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!profile) {
      navigate("/auth");
      return;
    }

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Navigation features may be limited.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      });
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

  // Example learning centers data
  const learningCenters: Location[] = [
    {
      id: "1",
      name: "National Public School",
      address: "Koramangala, Bangalore",
      students: 450,
      latitude: 12.952849,
      longitude: 77.630275
    },
    {
      id: "2",
      name: "The Brigade School",
      address: "JP Nagar, Bangalore",
      students: 380,
      latitude: 12.905093,
      longitude: 77.599910
    },
    {
      id: "3",
      name: "Delhi Public School",
      address: "Electronic City, Bangalore", 
      students: 520,
      latitude: 12.841280,
      longitude: 77.676323
    }
  ];

  const handleViewOnMap = (location: Location) => {
    setSelectedLocation(location);
    setIsNavigating(false); // Reset navigation state when viewing a new location
    // You could also pan/zoom the map to this location
  };

  const handleViewInfo = (location: Location) => {
    // Implement detailed info view logic here
    console.log("Viewing info for:", location.name);
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

        {/* Map Component */}
        <MapComponent 
          selectedLocation={selectedLocation}
          userLocation={userLocation}
          onViewInfo={handleViewInfo}
        />

        {/* List of Learning Centers */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">Nearby Learning Centers</h2>
          <div className="grid gap-4">
            {learningCenters.map(center => (
              <div key={center.id} className="sarathi-card flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{center.name}</h3>
                  <p className="text-sm text-muted-foreground">{center.address}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewOnMap(center)}
                  >
                    <MapPin size={14} className="mr-2" /> View on Map
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      handleViewOnMap(center);
                      setIsNavigating(true);
                    }}
                    disabled={isNavigating || !userLocation}
                  >
                    <Navigation size={14} className="mr-2" /> Navigate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapPage;
