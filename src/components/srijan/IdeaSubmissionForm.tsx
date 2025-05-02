
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMobileDetection } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { IdeaDraft } from "@/hooks/use-ideas";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  mediaUrl: z.string().optional(),
});

type IdeaFormValues = z.infer<typeof formSchema>;

type IdeaSubmissionFormProps = {
  onSubmitSuccess: () => void;
  submitIdea: (idea: IdeaDraft) => void;
  isOnline: boolean;
};

export function IdeaSubmissionForm({ 
  onSubmitSuccess, 
  submitIdea, 
  isOnline 
}: IdeaSubmissionFormProps) {
  const { profile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [draftKey] = useState(`idea-draft-${Date.now()}`);
  const [savedDrafts, setSavedDrafts] = useLocalStorage<Record<string, IdeaFormValues>>("idea-drafts", {});
  const isMobile = useMobileDetection();
  
  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      mediaUrl: "",
    },
  });

  // Auto-save draft every 5 seconds if changes are made
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.title || value.description) {
        const timer = setTimeout(() => {
          saveDraft();
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  const saveDraft = () => {
    const values = form.getValues();
    if (values.title || values.description) {
      setSavedDrafts({
        ...savedDrafts,
        [draftKey]: values,
      });
    }
  };
  
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setMediaFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      setMediaPreview(url);
      form.setValue("mediaUrl", url);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const removeMedia = () => {
    setMediaPreview(null);
    setMediaFile(null);
    form.setValue("mediaUrl", "");
  };
  
  const onSubmit = async (values: IdeaFormValues) => {
    if (!profile) return;
    
    const ideaData: IdeaDraft = {
      title: values.title,
      description: values.description,
      media: mediaFile || undefined,
      media_url: mediaFile ? undefined : values.mediaUrl
    };
    
    submitIdea(ideaData);
    
    // Remove from drafts
    const { [draftKey]: removedDraft, ...remainingDrafts } = savedDrafts;
    setSavedDrafts(remainingDrafts);
    
    onSubmitSuccess();
    form.reset();
    setMediaPreview(null);
    setMediaFile(null);
  };
  
  return (
    <Card className="bg-sarathi-darkCard border-sarathi-gray/30">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idea Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a catchy title for your idea" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your idea in detail..." 
                      className="min-h-[150px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Upload Image or Video (Optional)</FormLabel>
              <div className="flex items-center gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById("media-upload")?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-2" size={16} />
                  Upload Media
                </Button>
                <input
                  id="media-upload"
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleMediaUpload}
                />
                
                {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
              </div>
              
              {mediaPreview && (
                <div className="relative mt-4 max-w-md">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    className="absolute -right-2 -top-2 rounded-full p-0 h-8 w-8"
                    onClick={removeMedia}
                  >
                    <X size={16} />
                  </Button>
                  <img 
                    src={mediaPreview} 
                    alt="Media preview" 
                    className="rounded-md max-h-[200px] object-contain"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-between gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={saveDraft}
                className="flex-1"
              >
                <Save size={16} className="mr-2" />
                Save Draft
              </Button>
              
              <Button 
                type="submit" 
                className="flex-1"
              >
                {isOnline ? "Submit Idea" : "Save Offline"}
              </Button>
            </div>
            
            {!isOnline && (
              <p className="text-sm text-amber-400 flex items-center justify-center mt-2">
                You're offline. Your idea will be saved locally and submitted when you're back online.
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
