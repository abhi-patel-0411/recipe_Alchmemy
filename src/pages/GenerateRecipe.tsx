import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { generateRecipe, RecipeGenerationOptions, generateRecipeImageURL } from "@/lib/groq";
import { generateRecipeWithOpenAI, generateRecipeImageWithOpenAI } from "@/lib/openai";
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, Camera } from "lucide-react";
import VoicePromptSection from "@/components/recipe-form/VoicePromptSection";
import { cleanRecipeText } from "@/lib/textUtils";
import SocialShareButtons from "@/components/SocialShareButtons";

const GenerateRecipe = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voicePrompt, setVoicePrompt] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<Partial<Recipe> | null>(null);
  const [selectedAIService, setSelectedAIService] = useState<"groq" | "gemini" | "openai">(() => {
    return (localStorage.getItem("selected_ai_service") as "groq" | "gemini" | "openai") || "groq";
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedPrompt = localStorage.getItem("last_recipe_prompt");
    if (savedPrompt) {
      setVoicePrompt(savedPrompt);
    }
  }, []);

  const handleServiceChange = (service: "groq" | "gemini" | "openai") => {
    setSelectedAIService(service);
    localStorage.setItem("selected_ai_service", service);
  };

  const handleVoiceResult = (transcript: string) => {
    setVoicePrompt(transcript);
  };

  const generateRecipeImage = async (title: string) => {
    if (uploadedImage) {
      return uploadedImage;
    }

    setIsGeneratingImage(true);
    try {
      // Check if OpenAI image generation is enabled
      const imageGenEnabled = localStorage.getItem("openai_image_gen") !== "false";
      const openAIKeyExists = !!localStorage.getItem("openai_api_key");
      
      if (selectedAIService === "openai" && openAIKeyExists && imageGenEnabled) {
        // Use OpenAI for image generation
        const imageUrl = await generateRecipeImageWithOpenAI(title);
        setGeneratedImage(imageUrl);
        return imageUrl;
      } else {
        // Use fallback Unsplash image
        const imageUrl = generateRecipeImageURL(title);
        setGeneratedImage(imageUrl);
        return imageUrl;
      }
    } catch (error) {
      console.error("Error generating image:", error);
      const fallbackImageUrl = generateRecipeImageURL(title || "Food Recipe");
      setGeneratedImage(fallbackImageUrl);
      return fallbackImageUrl;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    toast.success("Image uploaded successfully");
  };

  const handleGenerateRecipe = async () => {
    try {
      if (!voicePrompt.trim() && !uploadedImage) {
        toast.error("Please provide a prompt or image to generate a recipe");
        return;
      }
      
      setIsGenerating(true);
      
      if (voicePrompt.trim()) {
        localStorage.setItem("last_recipe_prompt", voicePrompt);
      }
      
      toast.info(`Generating recipe with ${selectedAIService.toUpperCase()}...`);

      let response: Partial<Recipe> | null = null;
      
      if (selectedAIService === "openai") {
        const openAIKey = localStorage.getItem("openai_api_key");
        if (!openAIKey) {
          toast.error("OpenAI API key is not configured. Please set it in the OpenAI settings.");
          setIsGenerating(false);
          return;
        }
        response = await generateRecipeWithOpenAI(voicePrompt);
      } else {
        const options: RecipeGenerationOptions = { 
          aiService: selectedAIService
        };
        response = await generateRecipe(voicePrompt, options);
      }
      
      console.log("Recipe generation response:", response);
      
      if (response?.error) {
        toast.error(response.error);
        setIsGenerating(false);
        return;
      }

      // Generate image after getting the recipe, or use uploaded image
      let imageUrl;
      if (uploadedImage) {
        imageUrl = uploadedImage;
      } else {
        imageUrl = await generateRecipeImage(response?.title || voicePrompt);
      }
      
      setGeneratedRecipe({
        ...response,
        imageUrl
      });

      toast.success("Recipe generated successfully!");
    } catch (error) {
      console.error("Error generating recipe:", error);
      toast.error("Failed to generate recipe. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = () => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to save a recipe");
      navigate("/login");
      return;
    }

    if (!generatedRecipe) {
      toast.error("No recipe to save");
      return;
    }

    try {
      // Try to get existing recipes
      const existingRecipesStr = localStorage.getItem('recipes');
      let existingRecipes = [];
      
      if (existingRecipesStr) {
        try {
          existingRecipes = JSON.parse(existingRecipesStr);
        } catch (e) {
          console.error("Error parsing existing recipes", e);
          existingRecipes = [];
        }
      }

      // Create recipe object with all required fields
      const newRecipe: Recipe = {
        id: `recipe-${Date.now()}`,
        title: cleanRecipeText(generatedRecipe.title || "Untitled Recipe"),
        description: cleanRecipeText(generatedRecipe.description || ""),
        imageUrl: uploadedImage || generatedImage || generateRecipeImageURL(generatedRecipe.title || "Recipe"),
        prepTime: generatedRecipe.prepTime?.toString() || "0",
        cookTime: generatedRecipe.cookTime?.toString() || "0",
        servings: generatedRecipe.servings?.toString() || "1",
        difficulty: generatedRecipe.difficulty || "Medium",
        ingredients: Array.isArray(generatedRecipe.ingredients) ? generatedRecipe.ingredients : [],
        instructions: Array.isArray(generatedRecipe.instructions) ? generatedRecipe.instructions : [],
        tips: Array.isArray(generatedRecipe.tips) ? generatedRecipe.tips : [],
        tags: Array.isArray(generatedRecipe.tags) ? generatedRecipe.tags : [],
        userId: user.id,
        author: user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        generatedBy: selectedAIService,
        nutrition: generatedRecipe.nutrition || {
          calories: "350",
          protein: "15g",
          carbs: "30g",
          fats: "18g"
        }
      };

      // Handle localStorage quota exceeded error
      try {
        // Try to save the recipe directly
        existingRecipes.push(newRecipe);
        localStorage.setItem('recipes', JSON.stringify(existingRecipes));
      } catch (storageError) {
        console.error("Storage error:", storageError);
        
        // If we get a quota exceeded error, try to clean up old recipes
        if (existingRecipes.length > 10) {
          // Keep only the 10 most recent recipes
          existingRecipes = existingRecipes.slice(-10);
          existingRecipes.push(newRecipe);
          try {
            localStorage.setItem('recipes', JSON.stringify(existingRecipes));
          } catch (e) {
            // If still failing, save just this recipe
            localStorage.setItem('recipes', JSON.stringify([newRecipe]));
          }
        } else {
          // If we have few recipes but still failing, just save this one
          localStorage.setItem('recipes', JSON.stringify([newRecipe]));
        }
        toast.warning("Storage space limited - Only recent recipes are saved");
      }
      
      console.log("Recipe saved to localStorage", newRecipe);
      
      toast.success("Recipe saved successfully!");
      
      setTimeout(() => {
        navigate(`/recipe/${newRecipe.id}`);
      }, 500);
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe. Please try again.");
    }
  };

  const handleEditRecipe = () => {
    if (generatedRecipe) {
      localStorage.setItem('temp_recipe', JSON.stringify({
        ...generatedRecipe,
        imageUrl: uploadedImage || generatedImage
      }));
      navigate('/create');
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Generate <span className="gradient-text">Recipe</span> with AI
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Describe your recipe idea or upload a food image and let AI create the perfect dish
            </p>
          </div>
        </div>
      </div>
      
      <div className="container px-4 mx-auto py-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm" data-aos="fade-up">
          <VoicePromptSection
            voicePrompt={voicePrompt}
            onVoicePromptChange={setVoicePrompt}
            onVoiceResult={handleVoiceResult}
            onListeningChange={setIsVoiceActive}
            onClearPrompt={() => setVoicePrompt("")}
            onGenerate={handleGenerateRecipe}
            isGenerating={isGenerating}
            isVoiceActive={isVoiceActive}
            selectedAIService={selectedAIService}
            onAIServiceChange={handleServiceChange}
            onImageUpload={handleImageUpload}
          />
          
          {generatedRecipe && !generatedRecipe.error && (
            <div className="mt-8 border rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 p-4">
                <h2 className="text-2xl font-bold">{generatedRecipe.title}</h2>
                
                {(uploadedImage || generatedImage) && (
                  <div className="mt-4 relative">
                    {isGeneratingImage && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    )}
                    <img 
                      src={uploadedImage || generatedImage} 
                      alt={generatedRecipe.title || "Generated Recipe"}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={() => {
                        if (!uploadedImage) {
                          const newImageUrl = generateRecipeImageURL(generatedRecipe.title || "Food Recipe");
                          setGeneratedImage(newImageUrl);
                        }
                      }}
                    />
                  </div>
                )}
                
                <p className="mt-4 text-gray-600 dark:text-gray-300">{generatedRecipe.description}</p>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Prep Time</p>
                    <p className="font-medium">{generatedRecipe.prepTime} min</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cook Time</p>
                    <p className="font-medium">{generatedRecipe.cookTime} min</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Difficulty</p>
                    <p className="font-medium">{generatedRecipe.difficulty}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {generatedRecipe.ingredients?.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    {generatedRecipe.instructions?.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
                
                {generatedRecipe.tips && generatedRecipe.tips.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Tips</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {generatedRecipe.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {generatedRecipe.tags && generatedRecipe.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {generatedRecipe.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-md text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Share This Recipe</h3>
                  <SocialShareButtons 
                    url={`/recipe/${generatedRecipe.id || 'temp'}`}
                    title={generatedRecipe.title || 'Recipe'}
                    description={generatedRecipe.description}
                  />
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleSaveRecipe}
                    className="flex-1"
                  >
                    Save Recipe
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleEditRecipe}
                    className="flex-1"
                  >
                    Edit Recipe
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => {
                      setGeneratedRecipe(null);
                      setGeneratedImage(null);
                      setUploadedImage(null);
                    }}
                    className="flex-1"
                  >
                    Start Over
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {generatedRecipe?.error && (
            <div className="mt-8 p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                Error Generating Recipe
              </h3>
              <p>{generatedRecipe.error}</p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setGeneratedRecipe(null);
                    setIsGenerating(false);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateRecipe;
