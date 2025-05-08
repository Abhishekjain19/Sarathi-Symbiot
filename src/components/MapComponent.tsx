
import { useEffect, useRef, useState } from "react";
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type Location = {
  id: string;
  name: string;
  address: string;
  students: number;
  latitude: number;
  longitude: number;
}

type MapComponentProps = {
  selectedLocation: Location | null;
  userLocation: {latitude: number, longitude: number} | null;
  onViewInfo?: (location: Location) => void;
}

const MapComponent = ({ selectedLocation, userLocation, onViewInfo }: MapComponentProps) => {
  const mapRef = useRef<HTMLIFrameElement | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // We'll use Google Maps embed URL with different parameters 
  // based on whether we're navigating or just viewing
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Base URL for Google Maps embed
    let mapUrl = "https://www.google.com/maps/embed?pb=";
    
    // If we're navigating to a specific location and have user location
    if (selectedLocation && userLocation && isNavigating) {
      // Create URL for directions mode
      mapUrl = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8
        &origin=${userLocation.latitude},${userLocation.longitude}
        &destination=${selectedLocation.latitude},${selectedLocation.longitude}
        &mode=driving`;
    }
    // If just showing a selected location (no navigation)
    else if (selectedLocation) {
      // Create URL for place mode centered on the selected location
      mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8
        &q=${selectedLocation.name}
        &center=${selectedLocation.latitude},${selectedLocation.longitude}
        &zoom=15`;
    }
    // Default map showing all centers (fallback)
    else {
      mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.3741832842937!2d77.6302746745262!3d12.952848715877746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae159448caefd1%3A0x9429499b69999f9a!2sNational%20Public%20School%2C%20Koramangala!5e0!3m2!1sen!2sin!4v1714460109249!5m2!1sen!2sin";
    }
    
    // Update iframe source
    mapRef.current.src = mapUrl;
  }, [selectedLocation, userLocation, isNavigating]);

  const handleNavigate = () => {
    if (!selectedLocation || !userLocation) {
      toast({
        title: "Navigation Error",
        description: "Unable to get your location or destination.",
        variant: "destructive"
      });
      return;
    }
    
    setIsNavigating(true);
    toast({
      title: "Navigation Started",
      description: `Directing you to ${selectedLocation.name}`,
    });
  };

  return (
    <div className="relative">
      <iframe 
        ref={mapRef}
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
            <span className="text-sm">{selectedLocation.students} Students</span>
          </div>
          <div className="flex gap-2 mt-3">
            {onViewInfo && (
              <Button variant="secondary" size="sm" onClick={() => onViewInfo(selectedLocation)} className="w-1/2">
                View Info
              </Button>
            )}
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-1/2"
              onClick={handleNavigate}
              disabled={!userLocation || isNavigating}
            >
              {isNavigating ? 
                "Navigating..." : 
                <><Navigation size={14} className="mr-1" /> Navigate</>
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
