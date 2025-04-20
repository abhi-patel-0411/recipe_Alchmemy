
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const OpenAISettingsDialog = () => {
  const [openAIKey, setOpenAIKey] = useState("");
  const [enableImageGen, setEnableImageGen] = useState(true);
  const [enableImageAnalysis, setEnableImageAnalysis] = useState(true);
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key") || "";
    setOpenAIKey(savedKey);
    
    const imageGenEnabled = localStorage.getItem("openai_image_gen") !== "false";
    setEnableImageGen(imageGenEnabled);
    
    const imageAnalysisEnabled = localStorage.getItem("openai_image_analysis") !== "false";
    setEnableImageAnalysis(imageAnalysisEnabled);
  }, []);
  
  const saveSettings = () => {
    try {
      if (openAIKey) {
        localStorage.setItem("openai_api_key", openAIKey.trim());
        toast.success("OpenAI API key saved successfully!");
        
        if (!localStorage.getItem("selected_ai_service")) {
          localStorage.setItem("selected_ai_service", "openai");
        }
      } else {
        localStorage.removeItem("openai_api_key");
        toast.info("OpenAI API key removed");
        
        if (localStorage.getItem("selected_ai_service") === "openai") {
          localStorage.setItem("selected_ai_service", "groq");
        }
      }
      
      localStorage.setItem("openai_image_gen", String(enableImageGen));
      localStorage.setItem("openai_image_analysis", String(enableImageAnalysis));
      
      setOpen(false);
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Error saving settings:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveSettings();
    }
  };

  const handleTestConnection = async () => {
    if (!openAIKey) {
      toast.error("Please enter an API key first");
      return;
    }

    try {
      toast.info("Testing connection to OpenAI API...");
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          "Authorization": `Bearer ${openAIKey}`
        }
      });

      if (response.ok) {
        toast.success("API key is valid! Connection successful.");
      } else {
        const error = await response.json();
        toast.error(`Connection failed: ${error.error?.message || 'Invalid API key'}`);
      }
    } catch (error) {
      toast.error("Connection test failed");
      console.error("Error testing connection:", error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="OpenAI Settings (Recipe & Image Generation)">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>OpenAI API Settings</DialogTitle>
          <DialogDescription>
            Configure your OpenAI API key for recipe generation and image analysis.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="openai-key" className="text-sm font-medium">
              OpenAI API Key
            </label>
            <Input
              id="openai-key"
              type="password"
              placeholder="sk-..."
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser. We never send it to our servers.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="enable-image-gen"
              checked={enableImageGen}
              onCheckedChange={setEnableImageGen}
            />
            <Label htmlFor="enable-image-gen">Enable recipe image generation</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="enable-image-analysis"
              checked={enableImageAnalysis}
              onCheckedChange={setEnableImageAnalysis}
            />
            <Label htmlFor="enable-image-analysis">Enable food image analysis</Label>
          </div>

          <Button
            variant="secondary" 
            onClick={handleTestConnection}
            className="w-full"
            disabled={!openAIKey}
          >
            Test Connection
          </Button>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSettings}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpenAISettingsDialog;
