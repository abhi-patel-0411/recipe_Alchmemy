
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings } from "lucide-react";
import { toast } from "sonner";

interface AISettingsDialogProps {
  onAIServiceChange: (service: "groq" | "gemini" | "openai") => void;
  selectedAIService: "groq" | "gemini" | "openai";
}

const AISettingsDialog = ({ onAIServiceChange, selectedAIService }: AISettingsDialogProps) => {
  const [groqApiKey, setGroqApiKey] = useState(localStorage.getItem("groq_api_key") || "");
  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem("gemini_api_key") || "");
  const [openaiApiKey, setOpenaiApiKey] = useState(localStorage.getItem("openai_api_key") || "");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSaveSettings = () => {
    if (groqApiKey) {
      localStorage.setItem("groq_api_key", groqApiKey);
    } else {
      localStorage.removeItem("groq_api_key");
    }

    if (geminiApiKey) {
      localStorage.setItem("gemini_api_key", geminiApiKey);
    } else {
      localStorage.removeItem("gemini_api_key");
    }

    if (openaiApiKey) {
      localStorage.setItem("openai_api_key", openaiApiKey);
    } else {
      localStorage.removeItem("openai_api_key");
    }

    toast.success("AI settings saved successfully!");
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">AI Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Recipe Generation Settings</DialogTitle>
          <DialogDescription>
            Configure your AI services for recipe generation
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Select AI Service</Label>
            <RadioGroup
              defaultValue={selectedAIService}
              onValueChange={(value) => onAIServiceChange(value as "groq" | "gemini" | "openai")}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="groq" id="groq" />
                <Label htmlFor="groq">Groq AI (Default)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gemini" id="gemini" />
                <Label htmlFor="gemini">Google Gemini</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="openai" id="openai" />
                <Label htmlFor="openai">OpenAI</Label>
              </div>
            </RadioGroup>
          </div>

          {/* <div className="grid gap-2">
            <Label htmlFor="groq-api-key">Groq API Key</Label>
            <Input
              id="groq-api-key"
              type="password"
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              placeholder="Enter your Groq API key"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use mock data for testing
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gemini-api-key">Google Gemini API Key</Label>
            <Input
              id="gemini-api-key"
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Enter your Google Gemini API key"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use mock data for testing
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="openai-api-key">OpenAI API Key</Label>
            <Input
              id="openai-api-key"
              type="password"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use mock data for testing
            </p>
          </div> */}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSaveSettings}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AISettingsDialog;
