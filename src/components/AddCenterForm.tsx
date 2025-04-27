
import { useState } from "react";
import { Plus, School, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const centerTypes = [
  { id: "ngo", label: "NGO Center", icon: Building },
  { id: "school", label: "School", icon: School },
];

const facilities = [
  { id: "internet", label: "Internet" },
  { id: "tablets", label: "Tablets" },
  { id: "computer-lab", label: "Computer Lab" },
  { id: "library", label: "Library" },
  { id: "power-backup", label: "Power Backup" },
];

export const AddCenterForm = () => {
  const [open, setOpen] = useState(false);
  const [centerType, setCenterType] = useState<string>("ngo");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the center data
    toast({
      title: "Success",
      description: "Center added successfully",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <Plus size={16} className="mr-2" />
          Add Center
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-sarathi-darkCard text-white">
        <DialogHeader>
          <DialogTitle>Add New Learning Center</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Center Type</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {centerTypes.map((type) => (
                  <Button
                    key={type.id}
                    type="button"
                    variant={centerType === type.id ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setCenterType(type.id)}
                  >
                    <type.icon size={16} className="mr-2" />
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Center Name</Label>
              <Input id="name" placeholder="Enter center name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Enter full address" />
            </div>

            <div className="space-y-2">
              <Label>Available Facilities</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {facilities.map((facility) => (
                  <div key={facility.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={facility.id}
                      checked={selectedFacilities.includes(facility.id)}
                      onCheckedChange={(checked) => {
                        setSelectedFacilities(
                          checked
                            ? [...selectedFacilities, facility.id]
                            : selectedFacilities.filter((id) => id !== facility.id)
                        );
                      }}
                    />
                    <Label
                      htmlFor={facility.id}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {facility.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Add Center
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
