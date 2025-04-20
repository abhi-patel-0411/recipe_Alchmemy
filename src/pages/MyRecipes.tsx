
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MyRecipes = () => {
  const { user, isAuthenticated } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadUserRecipes = () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const allRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
      // Filter recipes by the current user's ID
      const userRecipes = allRecipes.filter(
        (recipe: Recipe) => recipe.userId === user?.id
      );
      setRecipes(userRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      toast.error("Failed to load your recipes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadUserRecipes();
  }, [user, isAuthenticated, navigate]);

  const handleRefresh = () => {
    loadUserRecipes();
    toast.success("Recipe list refreshed");
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              My <span className="gradient-text">Recipes</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage your culinary creations
            </p>
          </div>
        </div>
      </div>
      
      <div className="container px-4 mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Your Recipes</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              title="Refresh recipe list"
              className="hover:bg-gray-100"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/create")} className="bg-recipe-primary hover:bg-recipe-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create New Recipe
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse-gentle">Loading recipes...</div>
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">No recipes yet</h3>
            <p className="text-gray-500 mb-4">Create your first recipe to get started</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={() => navigate("/create")} className="bg-recipe-primary hover:bg-recipe-primary/90">
                Create Recipe
              </Button>
              <Button onClick={() => navigate("/generate")} variant="outline">
                Generate Recipe with AI
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecipes;
