
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info, MapPin, User, Search, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

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

  const navigateToLocation = useCallback(async (location: Location) => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "We need your current location to provide navigation.",
        variant: "destructive"
      });
      return;
    }

    setIsNavigating(true);
    try {
      // Skip the API call and go directly to Google Maps
      // This is more reliable as Google Maps has better routing capabilities
      const destination = `${location.latitude},${location.longitude}`;
      const origin = `${userLocation.latitude},${userLocation.longitude}`;
      
      // Open Google Maps with directions
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
      
      toast({
        title: "Navigation Started",
        description: `Directing you to ${location.name} using Google Maps`,
      });
    } catch (error) {
      console.error("Navigation error:", error);
      toast({
        title: "Navigation Error",
        description: "Unable to start navigation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsNavigating(false);
    }
  }, [userLocation]);

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
    // You could also pan/zoom the map to this location
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
          
          {/* Location Info */}
          {selectedLocation && (
            <div className="absolute top-4 left-4 bg-sarathi-darkCard border-sarathi-gray/30 rounded-md p-4 w-64">
              <h3 className="font-medium text-lg">{selectedLocation.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
              <div className="flex items-center gap-2 mt-2">
                <User size={14} className="text-muted-foreground" />
                <span className="text-sm">{selectedLocation.students} Students</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="secondary" size="sm" className="w-1/2">
                  <Info size={14} className="mr-1" /> Info
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-1/2"
                  onClick={() => navigateToLocation(selectedLocation)}
                  disabled={isNavigating || !userLocation}
                >
                  {isNavigating ? 
                    "Loading..." : 
                    <><Navigation size={14} className="mr-1" /> Navigate</>
                  }
                </Button>
              </div>
            </div>
          )}
        </div>

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
                    onClick={() => navigateToLocation(center)}
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
