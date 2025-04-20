
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RecipeForm from "@/components/recipe-form/RecipeForm";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { generateRecipeImageURL } from "@/lib/groq";
import { analyzeRecipeImage } from "@/lib/openai";
import { Recipe } from "@/types";
import { cleanRecipeText } from "@/lib/textUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, ImageIcon, Sparkles } from "lucide-react";

const CreateRecipe = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
    
    // Check for temporary recipe data
    const tempRecipe = localStorage.getItem('temp_recipe');
    if (tempRecipe) {
      // We'll handle this in the RecipeForm component
      console.log("Found temporary recipe data");
    }
    
  }, [isAuthenticated, navigate]);

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImage(imageUrl);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageAnalysis = async () => {
    if (uploadedImage) {
      toast.info("Analyzing image, please wait...");
      
      try {
        const result = await analyzeRecipeImage(uploadedImage);
        
        if (result.error) {
          toast.error(`Analysis failed: ${result.error}`);
          return;
        }
        
        // Set the generated image for the recipe
        setGeneratedImage(uploadedImage);
        
        // Close dialog
        setIsImageDialogOpen(false);
        
        // Show success
        toast.success("Image analyzed! Recipe details extracted.");
        
        // Return analysis results for further processing
        return result;
      } catch (error) {
        console.error("Image analysis error:", error);
        toast.error("Failed to analyze image. Please try again.");
      }
    } else {
      toast.error("Please upload an image first");
    }
  };

  const handleSubmit = (data: any) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to create a recipe");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform form data to match API expectations
      const formattedData = {
        ...data,
        ingredients: data.ingredients.map((i: any) => cleanRecipeText(i.value)),
        instructions: data.instructions.map((i: any) => cleanRecipeText(i.value)),
        tags: data.tags.map((t: any) => cleanRecipeText(t.value)).filter((t: string) => t.trim() !== "")
      };
      
      // Use generated image if available, uploaded image if that's available, or generate a new one
      const imageUrl = generatedImage || uploadedImage || generateRecipeImageURL(formattedData.title);

      // Create a recipe object with the current timestamp as ID
      const newRecipe: Recipe = {
        id: `recipe-${Date.now()}`,
        ...formattedData,
        userId: user.id,
        author: user,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        // Add information about which AI service generated this recipe (if any)
        generatedBy: localStorage.getItem("selected_ai_service") || undefined,
        nutrition: data.nutrition || {
          calories: "350",
          protein: "15g",
          carbs: "30g",
          fats: "18g"
        }
      };

      // Save recipe to localStorage for persistence
      try {
        // Get existing recipes from localStorage or initialize empty array
        const existingRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
        
        // Add new recipe to array
        existingRecipes.push(newRecipe);
        
        // Save updated array back to localStorage
        localStorage.setItem('recipes', JSON.stringify(existingRecipes));
        
        // Clear any temporary recipe data
        localStorage.removeItem('temp_recipe');
        
        console.log("Recipe saved to localStorage", newRecipe);
        
        // Success notification and navigation
        toast.success("Recipe created successfully!");
        
        // Navigate to the recipe page after a short delay
        setTimeout(() => {
          navigate(`/recipe/${newRecipe.id}`);
        }, 500);
      } catch (error) {
        console.error("Error saving recipe to localStorage:", error);
        toast.error("Failed to save recipe. Please try again.");
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      toast.error("Failed to create recipe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Create New <span className="gradient-text">Recipe</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Share your culinary creations with the world
            </p>

            <div className="mt-6 flex justify-center gap-4">
              <Button 
                onClick={() => setIsImageDialogOpen(true)}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Camera className="w-4 h-4" />
                Upload Food Photo
              </Button>
              
              <Button 
                onClick={() => navigate("/generate")}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container px-4 mx-auto py-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm" data-aos="fade-up">
          {uploadedImage && (
            <div className="mb-6">
              <div className="relative rounded-lg overflow-hidden h-48 w-full mb-2">
                <img 
                  src={uploadedImage} 
                  alt="Recipe" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-center text-gray-500">
                Your uploaded image will be used as the recipe cover
              </p>
            </div>
          )}
          
          <RecipeForm 
            onSubmit={handleSubmit} 
            isLoading={isSubmitting} 
            onImageGenerated={handleImageGenerated}
          />
        </div>
      </div>

      {/* Image Upload/Analysis Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Food Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 cursor-pointer" onClick={() => document.getElementById('image-upload')?.click()}>
              {uploadedImage ? (
                <div className="w-full h-48 relative">
                  <img 
                    src={uploadedImage} 
                    alt="Recipe preview" 
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              ) : (
                <>
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
              <input 
                id="image-upload" 
                type="file" 
                accept="image/*"
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!uploadedImage} onClick={handleImageAnalysis}>
                Analyze Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateRecipe;
