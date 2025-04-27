import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, School, Wifi, Info, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/App";
import { AddCenterForm } from "@/components/AddCenterForm";

// Mock map image URL
const mapImageUrl = "https://placehold.co/800x600/1a237e/ffffff?text=Map+View";

// Mock centers data
const centerLocations = [
  {
    id: 1,
    name: "Anandpur Learning Hub",
    type: "NGO Center",
    address: "Near Anandpur Bus Stand, Village Road, Anandpur",
    distance: "2.3 km",
    facilities: ["Internet", "Tablets", "Power backup"],
    icon: Wifi
  },
  {
    id: 2,
    name: "Surajpur High School",
    type: "School",
    address: "Main Street, Surajpur District, PIN: 324567",
    distance: "4.1 km",
    facilities: ["Computer Lab", "Library"],
    icon: School
  },
  {
    id: 3,
    name: "Krishnapur Center",
    type: "NGO Center",
    address: "Community Hall, Market Road, Krishnapur",
    distance: "5.5 km",
    facilities: ["Internet", "Tablets", "Weekly Classes"],
    icon: Wifi
  }
];

const MapPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const filteredCenters = centerLocations.filter(center => 
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      
      <main className="container mx-auto px-4 py-6 pb-20">
        <button 
          onClick={handleBack}
          className="flex items-center text-sm text-muted-foreground mb-4"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Find Learning Centers</h1>
          <AddCenterForm />
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by location or center name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sarathi-input pl-9"
          />
        </div>
        
        {/* Map and List View */}
        <div className="grid md:grid-cols-5 gap-4">
          {/* Map View */}
          <div className="md:col-span-3 h-[400px] md:h-[600px] rounded-xl overflow-hidden relative">
            <img 
              src={mapImageUrl} 
              alt="Map view" 
              className="w-full h-full object-cover"
            />
            {/* Map Pins - In a real implementation, these would be positioned based on coordinates */}
            <div className="absolute top-[30%] left-[40%] transform -translate-x-1/2 -translate-y-1/2">
              <button 
                className="bg-primary p-2 rounded-full hover:bg-primary/80 transition-colors"
                onClick={() => setSelectedCenter(1)}
              >
                <Wifi size={16} />
              </button>
            </div>
            <div className="absolute top-[50%] left-[60%] transform -translate-x-1/2 -translate-y-1/2">
              <button 
                className="bg-secondary p-2 rounded-full hover:bg-secondary/80 transition-colors"
                onClick={() => setSelectedCenter(2)}
              >
                <School size={16} />
              </button>
            </div>
            <div className="absolute top-[70%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
              <button 
                className="bg-primary p-2 rounded-full hover:bg-primary/80 transition-colors"
                onClick={() => setSelectedCenter(3)}
              >
                <Wifi size={16} />
              </button>
            </div>
          </div>
          
          {/* Centers List */}
          <div className="md:col-span-2 h-[400px] md:h-[600px] overflow-y-auto pr-2">
            <div className="grid gap-4">
              {filteredCenters.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Info size={24} className="mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No centers found matching your search</p>
                </div>
              ) : (
                filteredCenters.map((center) => (
                  <Card 
                    key={center.id} 
                    className={`bg-sarathi-darkCard border-2 transition-all ${
                      selectedCenter === center.id 
                        ? "border-secondary" 
                        : "border-sarathi-gray/30 hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedCenter(center.id)}
                  >
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <div className={`p-2 rounded-full ${
                        center.type === "NGO Center" 
                          ? "bg-primary/20 text-primary" 
                          : "bg-secondary/20 text-secondary"
                      }`}>
                        <center.icon size={18} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{center.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{center.type}</p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-2 text-sm mb-2">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
                        <p className="text-muted-foreground">{center.address}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1 flex-wrap">
                          {center.facilities.map((facility, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] px-1.5 py-0.5 rounded bg-sarathi-gray/30"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs bg-sarathi-gray/20 px-2 py-0.5 rounded">
                          {center.distance}
                        </span>
                      </div>
                      
                      <Button 
                        className="w-full mt-3 text-sm h-8" 
                        variant="outline"
                      >
                        Get Directions
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-sarathi-gray/20 p-4 rounded-lg">
          <p className="text-sm text-center text-muted-foreground">
            Map data can be saved for offline use. Connect to WiFi to download full maps.
          </p>
        </div>
      </main>
    </div>
  );
};

export default MapPage;
