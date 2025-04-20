
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X, Image as ImageIcon, Camera } from "lucide-react";
import VoiceInput from "@/components/ui/voice-input";
import AISettingsDialog from "./AISettingsDialog";
import OpenAISettingsDialog from "./OpenAISettingsDialog";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageUploadSection from "./ImageUploadSection";

interface VoicePromptSectionProps {
  voicePrompt: string;
  isGenerating: boolean;
  isVoiceActive: boolean;
  selectedAIService: "groq" | "gemini" | "openai";
  onVoicePromptChange: (value: string) => void;
  onVoiceResult: (transcript: string) => void;
  onListeningChange: (isListening: boolean) => void;
  onClearPrompt: () => void;
  onGenerate: () => void;
  onAIServiceChange: (service: "groq" | "gemini" | "openai") => void;
  onImageUpload?: (imageUrl: string) => void;
}

const VoicePromptSection = ({
  voicePrompt,
  isGenerating,
  isVoiceActive,
  selectedAIService,
  onVoicePromptChange,
  onVoiceResult,
  onListeningChange,
  onClearPrompt,
  onGenerate,
  onAIServiceChange,
  onImageUpload,
}: VoicePromptSectionProps) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageSubmit = () => {
    if (imageUrl.trim()) {
      if (onImageUpload) {
        onImageUpload(imageUrl);
        toast.success("Image added for recipe analysis");
      }
      setImageDialogOpen(false);
    } else if (uploadedImage) {
      if (onImageUpload) {
        onImageUpload(uploadedImage);
        toast.success("Image added for recipe analysis");
      }
      setImageDialogOpen(false);
    } else {
      toast.error("Please enter a valid image URL or upload an image");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        toast.error("Image is too large. Maximum size is 10MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImage(result);
        if (onImageUpload) {
          onImageUpload(result);
          toast.success("Image uploaded for recipe analysis");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4 bg-muted/40 p-4 rounded-lg border">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Generate Recipe with AI</h3>
        <div className="flex items-center gap-2">
          <Badge variant={selectedAIService === "groq" ? "default" : "outline"}>
            {selectedAIService === "groq" ? "Using Groq" : 
             selectedAIService === "gemini" ? "Using Gemini" : "Using OpenAI"}
          </Badge>
          <AISettingsDialog 
            onAIServiceChange={onAIServiceChange}
            selectedAIService={selectedAIService}
          />
          <OpenAISettingsDialog />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setImageDialogOpen(true)}
            title="Upload image for recipe"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Textarea
            placeholder="Describe the recipe you want to generate..."
            value={voicePrompt}
            onChange={(e) => onVoicePromptChange(e.target.value)}
            className="h-20 pr-10"
          />
          {voicePrompt && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onClearPrompt}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <VoiceInput
            onResult={onVoiceResult}
            onListening={onListeningChange}
          />
          <ImageUploadSection onImageAnalyzed={(recipe) => {
            onVoicePromptChange(recipe.title + "\n" + recipe.description);
            onGenerate();
          }} />
          <Button
            onClick={onGenerate}
            disabled={isGenerating || (!voicePrompt && !isVoiceActive && !uploadedImage)}
            className="bg-recipe-primary hover:bg-recipe-primary/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Recipe"
            )}
          </Button>
        </div>
      </div>
      
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Recipe Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-2">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                   onClick={triggerFileInput}>
                {uploadedImage ? (
                  <div className="relative w-full h-48">
                    <img src={uploadedImage} alt="Recipe image" className="w-full h-full object-cover rounded-md" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedImage(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Camera className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImageSubmit}>
                Add Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoicePromptSection;
