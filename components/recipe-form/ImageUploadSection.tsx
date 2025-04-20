
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadSectionProps {
  onImageAnalyzed: (recipe: any) => void;
}

const ImageUploadSection = ({ onImageAnalyzed }: ImageUploadSectionProps) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image is too large. Maximum size is 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageBase64 = reader.result as string;
        setUploadedImage(imageBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }

    const openAIKey = localStorage.getItem("openai_api_key");
    if (!openAIKey) {
      toast.error("Please configure your OpenAI API key first");
      return;
    }

    const imageAnalysisEnabled = localStorage.getItem("openai_image_analysis") !== "false";
    if (!imageAnalysisEnabled) {
      toast.error("Image analysis is disabled. Please enable it in OpenAI settings");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Use gpt-4o which supports vision
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAIKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a helpful cooking assistant. Analyze the image and generate a detailed recipe with all necessary information including title, description, ingredients, cooking time, and steps."
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this food image and generate a detailed recipe. Include title, description, ingredients, cooking times, difficulty, and detailed steps." },
                { type: "image_url", image_url: { url: uploadedImage } }
              ]
            }
          ],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to analyze image");
      }

      const data = await response.json();
      const recipeText = data.choices[0].message.content;
      
      // Parse the recipe text
      const recipe = parseRecipeText(recipeText);
      onImageAnalyzed(recipe);
      setImageDialogOpen(false);
      toast.success("Recipe generated from image!");
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error(`Failed to analyze image: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseRecipeText = (text: string) => {
    const recipe: any = {
      title: "",
      description: "",
      ingredients: [],
      instructions: [],
      prepTime: "",
      cookTime: "",
      servings: "",
      difficulty: "Medium",
      tags: []
    };

    // Try to find title section
    const titleMatch = text.match(/title:?\s*([^\n]+)/i);
    if (titleMatch) recipe.title = titleMatch[1].trim();
    
    // Try to find description section
    const descMatch = text.match(/description:?\s*([^\n]+(?:\n[^\n]+)*?)(?=\n\s*\n|\n\s*[A-Za-z]+:)/is);
    if (descMatch) recipe.description = descMatch[1].trim();
    
    // Try to find prep time
    const prepMatch = text.match(/prep\s*time:?\s*(\d+)/i);
    if (prepMatch) recipe.prepTime = prepMatch[1].trim();
    
    // Try to find cook time
    const cookMatch = text.match(/cook\s*time:?\s*(\d+)/i);
    if (cookMatch) recipe.cookTime = cookMatch[1].trim();
    
    // Try to find servings
    const servingsMatch = text.match(/servings:?\s*(\d+)/i);
    if (servingsMatch) recipe.servings = servingsMatch[1].trim();
    
    // Try to find difficulty
    const difficultyMatch = text.match(/difficulty:?\s*([^\n]+)/i);
    if (difficultyMatch) {
      const diffText = difficultyMatch[1].toLowerCase().trim();
      recipe.difficulty = diffText.includes("easy") ? "Easy" :
                        diffText.includes("hard") ? "Hard" : "Medium";
    }

    // Try to find ingredients section
    const ingredientsMatch = text.match(/ingredients:?\s*([\s\S]*?)(?=\n\s*\n|\n\s*[A-Za-z]+:)/i);
    if (ingredientsMatch) {
      recipe.ingredients = ingredientsMatch[1]
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line && !line.toLowerCase().includes('ingredient'))
        .map((line: string) => line.replace(/^[-•*]\s*/, ''));
    }
    
    // Try to find instructions section
    const instructionsMatch = text.match(/(?:instructions|steps|directions):?\s*([\s\S]*?)(?=\n\s*\n|\n\s*[A-Za-z]+:|$)/i);
    if (instructionsMatch) {
      recipe.instructions = instructionsMatch[1]
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line && !line.toLowerCase().includes('instruction') && !line.toLowerCase().includes('step'))
        .map((line: string) => {
          return line.replace(/^\d+[.)]\s*/, '').replace(/^[-•*]\s*/, '');
        });
    }

    return recipe;
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setImageDialogOpen(true)}
        title="Generate recipe from image"
      >
        <Camera className="h-4 w-4" />
      </Button>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Recipe from Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div 
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 cursor-pointer transition-colors hover:border-gray-400 dark:hover:border-gray-500"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedImage ? (
                <div className="w-full h-48 relative">
                  <img 
                    src={uploadedImage} 
                    alt="Recipe preview" 
                    className="w-full h-full object-cover rounded-md"
                  />
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
                <>
                  <Camera className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                </>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setImageDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={analyzeImage}
                disabled={!uploadedImage || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Generate Recipe"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageUploadSection;
