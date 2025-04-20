
import { useState, useEffect } from "react";
import { Recipe } from "@/types";
import { Link } from "react-router-dom";
import { getRandomPlaceholderImage } from "@/lib/groq";

interface RelatedRecipesProps {
  tags: string[];
  currentRecipeId: string;
}

const RelatedRecipes = ({ tags, currentRecipeId }: RelatedRecipesProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    // Mock API call to get related recipes
    // In a real app, you would fetch this from an API based on tags
    setTimeout(() => {
      // Generate 2 mock recipes
      const mockRecipes: Recipe[] = [
        {
          id: "related1",
          title: "Garlic Butter Shrimp Pasta",
          description: "Delicious shrimp pasta with a garlic butter sauce",
          imageUrl: getRandomPlaceholderImage(),
          prepTime: "10",
          cookTime: "15",
          servings: "2",
          difficulty: "Easy",
          ingredients: ["Pasta", "Shrimp", "Garlic", "Butter"],
          instructions: ["Cook pasta", "Sauté shrimp", "Mix together"],
          tips: ["Use fresh shrimp for best results"],
          tags: ["pasta", "seafood", "quick"],
          nutrition: {
            calories: "420",
            protein: "18g",
            carbs: "40g",
            fats: "22g"
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
          likes: 28,
          comments: []
        },
        {
          id: "related2",
          title: "Classic Margherita Pizza",
          description: "Simple yet delicious Italian pizza with fresh ingredients",
          imageUrl: getRandomPlaceholderImage(),
          prepTime: "20",
          cookTime: "10",
          servings: "4",
          difficulty: "Medium",
          ingredients: ["Pizza dough", "Tomatoes", "Mozzarella", "Basil"],
          instructions: ["Prepare dough", "Add toppings", "Bake"],
          tips: ["Use buffalo mozzarella if available"],
          tags: ["italian", "pizza", "vegetarian"],
          nutrition: {
            calories: "320",
            protein: "12g",
            carbs: "38g",
            fats: "14g"
          },
          userId: "2",
          author: {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            profileImageUrl: "https://i.pravatar.cc/150?u=jane",
            createdAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 35,
          comments: []
        }
      ];
      
      setRecipes(mockRecipes);
    }, 800);
  }, [tags, currentRecipeId]);

  if (recipes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">You might also like</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">You might also like</h3>
      <div className="space-y-4">
        {recipes.map((recipe) => (
          <Link 
            key={recipe.id} 
            to={`/recipe/${recipe.id}`} 
            className="flex items-center gap-3 group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
          >
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title} 
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-medium group-hover:text-recipe-primary transition-colors line-clamp-1">
                {recipe.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {recipe.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Link 
          to="/explore" 
          className="text-sm text-recipe-primary hover:text-recipe-primary/80 font-medium"
        >
          View more recipes
        </Link>
      </div>
    </div>
  );
};

export default RelatedRecipes;
