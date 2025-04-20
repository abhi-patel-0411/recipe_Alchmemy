
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Recipe as RecipeType } from "@/types";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Clock, Utensils, Users, ArrowLeft, BookmarkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FacebookShareButton,
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon,
} from "react-share";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getRandomPlaceholderImage } from "@/lib/groq";
import { useAuth } from "@/contexts/AuthContext";
import CommentSection from "@/components/CommentSection";
import NutritionCard from "@/components/NutritionCard";
import RelatedRecipes from "@/components/RelatedRecipes";

const Recipe = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    const fetchRecipe = () => {
      setIsLoading(true);
      
      try {
        const savedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
        const foundRecipe = savedRecipes.find((r: any) => r.id === id);
        
        if (foundRecipe) {
          console.log("Recipe found in localStorage:", foundRecipe);
          
          // Set default values for any missing properties
          const safeRecipe = {
            ...foundRecipe,
            ingredients: foundRecipe.ingredients || [],
            instructions: foundRecipe.instructions || [],
            tips: foundRecipe.tips || [],
            tags: foundRecipe.tags || [],
            comments: foundRecipe.comments || [],
            nutrition: foundRecipe.nutrition || {
              calories: "0",
              protein: "0g",
              carbs: "0g",
              fats: "0g"
            }
          };
          
          setRecipe(safeRecipe);
          setLikes(safeRecipe.likes || 0);
          setLiked(safeRecipe.liked || false);
          
          // Check if this recipe is saved by current user
          if (isAuthenticated && user) {
            const savedRecipes = localStorage.getItem(`${user.id}_saved_recipes`);
            if (savedRecipes) {
              const savedIds = JSON.parse(savedRecipes);
              setSaved(savedIds.includes(id));
            }
          }
          
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error fetching recipe from localStorage:", error);
      }
      
      setTimeout(() => {
        // If recipe not found in localStorage, create a mock recipe
        const mockRecipe: RecipeType = {
          id: id || "1",
          title: "Creamy Garlic Parmesan Pasta",
          description: "A quick and easy pasta dish that's perfect for weeknight dinners. Creamy, garlicky, and ready in under 30 minutes!",
          imageUrl: getRandomPlaceholderImage(),
          prepTime: "10",
          cookTime: "20",
          servings: "4",
          difficulty: "Easy",
          ingredients: [
            "8 oz pasta",
            "2 tbsp butter",
            "4 cloves garlic, minced",
            "1 cup heavy cream",
            "1 cup parmesan cheese, grated",
            "Salt and pepper to taste",
            "Fresh parsley for garnish"
          ],
          instructions: [
            "Cook pasta according to package directions. Drain and set aside.",
            "In a large skillet, melt butter over medium heat. Add minced garlic and cook until fragrant, about 1 minute.",
            "Pour in heavy cream and bring to a simmer. Cook for 2-3 minutes until slightly thickened.",
            "Stir in parmesan cheese until melted and smooth.",
            "Add cooked pasta to the skillet and toss to coat with the sauce.",
            "Season with salt and pepper to taste.",
            "Garnish with fresh parsley before serving."
          ],
          tips: [
            "Use freshly grated parmesan for the best flavor and melting properties.",
            "Save some pasta water to thin out the sauce if needed.",
            "Add grilled chicken or sautéed shrimp for extra protein."
          ],
          tags: ["pasta", "quick", "vegetarian", "italian"],
          nutrition: {
            calories: "450",
            protein: "12g",
            carbs: "45g",
            fats: "28g"
          },
          userId: "1",
          author: {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            profileImageUrl: "https://i.pravatar.cc/150?u=john",
            createdAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 42,
          liked: false,
          comments: [
            {
              id: "1",
              content: "This was amazing! My family loved it.",
              userId: "2",
              author: {
                id: "2",
                name: "Jane Smith",
                email: "jane@example.com",
                profileImageUrl: "https://i.pravatar.cc/150?u=jane",
                createdAt: new Date().toISOString()
              },
              recipeId: id || "1",
              createdAt: new Date().toISOString()
            },
            {
              id: "2",
              content: "I added some red pepper flakes for a bit of heat. Perfect!",
              userId: "3",
              author: {
                id: "3",
                name: "Alex Johnson",
                email: "alex@example.com",
                profileImageUrl: "https://i.pravatar.cc/150?u=alex",
                createdAt: new Date().toISOString()
              },
              recipeId: id || "1",
              createdAt: new Date().toISOString()
            }
          ]
        };
        
        setRecipe(mockRecipe);
        setLikes(mockRecipe.likes);
        setLiked(mockRecipe.liked || false);
        setIsLoading(false);
      }, 800);
    };

    fetchRecipe();

    window.scrollTo(0, 0);
  }, [id, isAuthenticated, user]);

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error("Please login to like recipes");
      return;
    }
    
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    
    try {
      const savedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
      const recipeIndex = savedRecipes.findIndex((r: any) => r.id === id);
      
      if (recipeIndex !== -1) {
        savedRecipes[recipeIndex].liked = !liked;
        savedRecipes[recipeIndex].likes = liked ? likes - 1 : likes + 1;
        localStorage.setItem('recipes', JSON.stringify(savedRecipes));
        
        // Also update the user's liked recipes list
        if (user) {
          const likedRecipeIds = localStorage.getItem(`${user.id}_liked_recipes`) || "[]";
          const likedIds = JSON.parse(likedRecipeIds);
          
          if (!liked) {
            // Add to liked recipes if not already there
            if (!likedIds.includes(id)) {
              likedIds.push(id);
            }
          } else {
            // Remove from liked recipes
            const index = likedIds.indexOf(id);
            if (index > -1) {
              likedIds.splice(index, 1);
            }
          }
          
          localStorage.setItem(`${user.id}_liked_recipes`, JSON.stringify(likedIds));
        }
      }
    } catch (error) {
      console.error("Error updating like status:", error);
    }
    
    toast.success(liked ? "Recipe unliked" : "Recipe liked!");
  };
  
  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error("Please login to save recipes");
      return;
    }
    
    setSaved(!saved);
    
    try {
      if (user) {
        const savedRecipeIds = localStorage.getItem(`${user.id}_saved_recipes`) || "[]";
        const savedIds = JSON.parse(savedRecipeIds);
        
        if (!saved) {
          // Add to saved recipes if not already there
          if (!savedIds.includes(id)) {
            savedIds.push(id);
          }
          toast.success("Recipe saved to your collection!");
        } else {
          // Remove from saved recipes
          const index = savedIds.indexOf(id);
          if (index > -1) {
            savedIds.splice(index, 1);
          }
          toast.success("Recipe removed from your collection");
        }
        
        localStorage.setItem(`${user.id}_saved_recipes`, JSON.stringify(savedIds));
      }
    } catch (error) {
      console.error("Error updating save status:", error);
    }
  };

  const shareUrl = `${window.location.origin}/recipe/${id}`;
  const shareTitle = recipe ? `Check out this amazing recipe: ${recipe.title}` : "Check out this amazing recipe!";

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container px-4 mx-auto py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse-gentle">Loading recipe...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container px-4 mx-auto py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Recipe not found</h2>
            <Button asChild>
              <Link to="/explore">
                <ArrowLeft className="mr-2" />
                Back to Recipes
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure arrays are defined to prevent map errors
  const safeTags = Array.isArray(recipe.tags) ? recipe.tags : [];
  const safeIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const safeInstructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
  const safeTips = Array.isArray(recipe.tips) ? recipe.tips : [];
  const safeComments = Array.isArray(recipe.comments) ? recipe.comments : [];

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="relative h-[40vh] md:h-[60vh]" data-aos="fade-in">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-20">
          <div className="container mx-auto">
            <div className="flex gap-2 mb-4 flex-wrap">
              {safeTags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="bg-white/20 backdrop-blur-sm text-white border-none">
                  {tag}
                </Badge>
              ))}
              <Badge variant="outline" className="bg-recipe-primary/80 backdrop-blur-sm text-white border-none">
                {recipe.difficulty}
              </Badge>
              {recipe.generatedBy && (
                <Badge variant="outline" className="bg-purple-500/80 backdrop-blur-sm text-white border-none">
                  Generated with {recipe.generatedBy.charAt(0).toUpperCase() + recipe.generatedBy.slice(1)}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 drop-shadow-md">
              {recipe.title}
            </h1>
            <div className="flex items-center text-white/90 space-x-4 text-sm md:text-base">
              <Link to={`/profile/${recipe.author?.id}`} className="flex items-center hover:text-white">
                <img 
                  src={recipe.author?.profileImageUrl || "https://i.pravatar.cc/150?u=default"} 
                  alt={recipe.author?.name || "Author"} 
                  className="w-8 h-8 rounded-full mr-2 border-2 border-white/50"
                />
                <span>{recipe.author?.name || "Unknown Author"}</span>
              </Link>
              <span>•</span>
              <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col-reverse md:flex-row gap-8">
          <div className="md:w-2/3" data-aos="fade-up">
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm mb-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-5 h-5 text-recipe-primary" />
                    <span>Prep: {recipe.prepTime} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Utensils className="w-5 h-5 text-recipe-primary" />
                    <span>Cook: {recipe.cookTime} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-5 h-5 text-recipe-primary" />
                    <span>Serves: {recipe.servings}</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleLike}
                    className="flex items-center space-x-1 text-sm p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={liked ? "Unlike recipe" : "Like recipe"}
                  >
                    <Heart 
                      className={`w-5 h-5 ${liked ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
                    />
                    <span>{likes}</span>
                  </button>
                  <Link 
                    to="#comments"
                    className="flex items-center space-x-1 text-sm p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="See comments"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-500" />
                    <span>{safeComments.length}</span>
                  </Link>
                  
                  <button 
                    onClick={handleSave}
                    className="flex items-center space-x-1 text-sm p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={saved ? "Remove from saved recipes" : "Save recipe"}
                  >
                    <BookmarkIcon 
                      className={`w-5 h-5 ${saved ? 'text-recipe-primary fill-recipe-primary' : 'text-gray-500'}`} 
                    />
                  </button>
                  
                  <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                    <DialogTrigger asChild>
                      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Share2 className="w-5 h-5 text-gray-500" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Share this recipe</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col space-y-4 py-4">
                        <div className="flex justify-center space-x-4">
                          <FacebookShareButton url={shareUrl} title={shareTitle}>
                            <FacebookIcon size={40} round />
                          </FacebookShareButton>
                          <WhatsappShareButton url={shareUrl} title={shareTitle}>
                            <WhatsappIcon size={40} round />
                          </WhatsappShareButton>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="text" 
                            value={shareUrl}
                            readOnly
                            className="flex-1 p-2 text-sm border rounded-md"
                          />
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(shareUrl);
                              toast.success("Link copied to clipboard!");
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                {recipe.description}
              </p>

              <Tabs defaultValue="ingredients" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                </TabsList>
                
                <TabsContent value="ingredients" className="space-y-6">
                  <ul className="space-y-3">
                    {safeIngredients.map((ingredient, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="w-2 h-2 mt-2 rounded-full bg-recipe-primary mr-3"></div>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="instructions" className="space-y-6">
                  <ol className="space-y-6">
                    {safeInstructions.map((instruction, idx) => (
                      <li key={idx} className="flex">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-recipe-primary/10 text-recipe-primary flex items-center justify-center mr-4 font-medium">
                          {idx + 1}
                        </span>
                        <p className="pt-1">{instruction}</p>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
                
                <TabsContent value="tips" className="space-y-6">
                  {safeTips.length > 0 ? (
                    <ul className="space-y-3">
                      {safeTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="w-2 h-2 mt-2 rounded-full bg-recipe-accent mr-3"></div>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No tips available for this recipe.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div id="comments" className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm" data-aos="fade-up" data-aos-delay="100">
              <h3 className="text-xl font-semibold mb-6">Comments ({safeComments.length})</h3>
              <CommentSection 
                comments={safeComments} 
                recipeId={recipe.id}
              />
            </div>
          </div>
          
          <div className="md:w-1/3 space-y-6" data-aos="fade-up" data-aos-delay="50">
            <NutritionCard nutrition={recipe.nutrition || {
              calories: "0",
              protein: "0g",
              carbs: "0g",
              fats: "0g"
            }} />
            
            <RelatedRecipes tags={safeTags} currentRecipeId={recipe.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recipe;
