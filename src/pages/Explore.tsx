
import { useState, useEffect } from "react";
import { Recipe } from "@/types";
import { getRandomPlaceholderImage } from "@/lib/groq";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Utensils } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import VoiceInput from "@/components/ui/voice-input";
import { useNavigate } from "react-router-dom";

// Mock tags for filtering
const availableTags = [
  "vegetarian", "vegan", "gluten-free", "dairy-free", "keto", "paleo",
  "low-carb", "breakfast", "lunch", "dinner", "dessert", "snack",
  "italian", "mexican", "asian", "indian", "american", "mediterranean",
  "quick", "easy", "healthy", "comfort-food", "batch-cooking", "soup",
  "salad", "pasta", "rice", "chicken", "beef", "seafood", "pork"
];
const gujaratiRecipes = ["Dhokla", "Khandvi", "Thepla", "Undhiyu", "Farsan"];
  const punjabiRecipes = ["Butter Chicken", "Chole Bhature", "Sarson Da Saag", "Makki Di Roti", "Aloo Paratha"];
  const chineseRecipes = ["Chow Mein", "Spring Rolls", "Manchurian", "Sweet and Sour Chicken", "Fried Rice"];

  const allRecipes = [...gujaratiRecipes, ...punjabiRecipes, ...chineseRecipes];
  

const Explore = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [voiceQuery, setVoiceQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("newest");
  const navigate = useNavigate();

  // Function to combine user recipes with mock recipes
  const loadAllRecipes = () => {
    setIsLoading(true);

    // Get user-created recipes from localStorage
    const userRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    
    // Generate some mock recipes if needed
    const mockRecipesCount = Math.max(0, 12 - userRecipes.length);
    const mockRecipes = mockRecipesCount > 0 ? generateMockRecipes(mockRecipesCount) : [];
    
    // Combine user recipes with mock recipes
    const allRecipes = [...userRecipes, ...mockRecipes];
    
    setRecipes(allRecipes);
    setFilteredRecipes(allRecipes);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllRecipes();
  }, []);

  // Generate mock recipes function
  const generateMockRecipes = (count: number): Recipe[] => {
    const difficulties = ["Easy", "Medium", "Hard"];
    const mockRecipes: Recipe[] = [];
    
    for (let i = 0; i < count; i++) {
      const id = `mock-recipe-${i + 1}`;
      const randomRecipe = allRecipes[Math.floor(Math.random() * allRecipes.length)];
      mockRecipes.push({
        id,
        // title: `Recipe ${i + 1}`,
        title:randomRecipe,
        description: `This is a delicious recipe number ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        imageUrl: getRandomPlaceholderImage(),
        prepTime: `${Math.floor(Math.random() * 20) + 5}`,
        cookTime: `${Math.floor(Math.random() * 40) + 10}`,
        servings: `${Math.floor(Math.random() * 6) + 1}`,
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)] as "Easy" | "Medium" | "Hard",
        ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
        instructions: ["Step 1", "Step 2", "Step 3"],
        tips: ["Tip 1", "Tip 2"],
        tags: availableTags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 1),
        nutrition: {
          calories: `${Math.floor(Math.random() * 500) + 200}`,
          protein: `${Math.floor(Math.random() * 30) + 5}g`,
          carbs: `${Math.floor(Math.random() * 50) + 20}g`,
          fats: `${Math.floor(Math.random() * 30) + 5}g`
        },
        userId: `user-${Math.floor(Math.random() * 5) + 1}`,
        author: {
          id: `user-${Math.floor(Math.random() * 5) + 1}`,
          name: `User ${Math.floor(Math.random() * 5) + 1}`,
          email: `user${Math.floor(Math.random() * 5) + 1}@example.com`,
          profileImageUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
          createdAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: Math.floor(Math.random() * 50),
        comments: []
      });
    }
    
    return mockRecipes;
  };

  useEffect(() => {
    // Apply filters and search
    let result = [...recipes];
    
    // Apply search
    const query = searchQuery || voiceQuery;
    if (query) {
      result = result.filter((recipe) => 
        recipe.title.toLowerCase().includes(query.toLowerCase()) ||
        recipe.description.toLowerCase().includes(query.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Apply difficulty filter
    if (selectedDifficulty) {
      result = result.filter((recipe) => recipe.difficulty === selectedDifficulty);
    }
    
    // Apply tag filters
    if (selectedTags.length > 0) {
      result = result.filter((recipe) => 
        selectedTags.some(tag => recipe.tags.includes(tag))
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "popular":
        result.sort((a, b) => b.likes - a.likes);
        break;
      case "prep-asc":
        result.sort((a, b) => parseInt(a.prepTime) + parseInt(a.cookTime) - (parseInt(b.prepTime) + parseInt(b.cookTime)));
        break;
      case "prep-desc":
        result.sort((a, b) => parseInt(b.prepTime) + parseInt(b.cookTime) - (parseInt(a.prepTime) + parseInt(a.cookTime)));
        break;
      default:
        break;
    }
    
    setFilteredRecipes(result);
  }, [recipes, searchQuery, voiceQuery, selectedDifficulty, selectedTags, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is already handled in the useEffect
    
    // If no matching recipes and there's a search query, show the option to create recipe
    if (filteredRecipes.length === 0 && (searchQuery || voiceQuery)) {
      // Do nothing special here, UI will show the "no recipes found" message
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setVoiceQuery(transcript);
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreateRecipe = () => {
    navigate('/create', { state: { initialTitle: searchQuery || voiceQuery } });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setVoiceQuery("");
    setSelectedDifficulty("");
    setSelectedTags([]);
    setSortOption("newest");
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-10">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-8" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="gradient-text">Explore</span> Recipes
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover delicious recipes for any occasion or dietary preference
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="100">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center">
                <Search className="absolute left-3 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for recipes, ingredients, or cuisine..."
                  className="pl-10 pr-28 py-6 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-recipe-primary"
                  value={searchQuery || voiceQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVoiceQuery("");
                  }}
                />
                <div className="absolute right-2 flex">
                  <VoiceInput 
                    onResult={handleVoiceResult}
                    className="mr-2"
                  />
                  
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Filter Recipes</SheetTitle>
                        <SheetDescription>
                          Narrow down your search with these filters
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-4 space-y-6">
                        <div>
                          <h3 className="text-sm font-medium mb-3">Difficulty</h3>
                          <div className="flex flex-wrap gap-2">
                            {["Easy", "Medium", "Hard"].map((difficulty) => (
                              <button
                                key={difficulty}
                                className={`px-4 py-2 rounded-full text-sm ${
                                  selectedDifficulty === difficulty
                                    ? "bg-recipe-primary text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                                }`}
                                onClick={() => setSelectedDifficulty(
                                  selectedDifficulty === difficulty ? "" : difficulty
                                )}
                              >
                                {difficulty}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-3">Tags</h3>
                          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                            {availableTags.map((tag) => (
                              <button
                                key={tag}
                                className={`px-3 py-1 rounded-full text-xs ${
                                  selectedTags.includes(tag)
                                    ? "bg-recipe-primary text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                                }`}
                                onClick={() => handleTagSelect(tag)}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          onClick={clearFilters}
                          className="w-full"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Filters and Results */}
      <div className="container px-4 mx-auto py-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold">
              {isLoading ? "Loading recipes..." : `${filteredRecipes.length} Recipes Found`}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Utensils className="h-4 w-4 text-gray-500" />
            <span className="text-gray-500 text-sm mr-2">Sort by:</span>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="prep-asc">Quickest to Make</SelectItem>
                  <SelectItem value="prep-desc">Longest to Make</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Active Filters */}
        {(selectedTags.length > 0 || selectedDifficulty) && (
          <div className="mb-6" data-aos="fade-up">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Active Filters:</span>
              
              {selectedDifficulty && (
                <Badge variant="outline" className="bg-recipe-primary/10 text-recipe-primary border-recipe-primary/20">
                  {selectedDifficulty}
                  <button 
                    onClick={() => setSelectedDifficulty("")}
                    className="ml-1 text-xs"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {selectedTags.map(tag => (
                <Badge key={tag} variant="outline" className="bg-recipe-primary/10 text-recipe-primary border-recipe-primary/20">
                  {tag}
                  <button 
                    onClick={() => handleTagSelect(tag)}
                    className="ml-1 text-xs"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
        
        {/* Recipe Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-t-xl"></div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-b-xl">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <div 
                key={recipe.id} 
                data-aos="fade-up" 
                data-aos-delay={index * 50}
              >
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
            <Utensils className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || voiceQuery ? 
                "Would you like to create a new recipe?" : 
                "Try adjusting your filters or search term"}
            </p>
            {searchQuery || voiceQuery ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={clearFilters}>Clear Filters</Button>
                <Button 
                  onClick={handleCreateRecipe}
                  className="bg-recipe-primary hover:bg-recipe-primary/90"
                >
                  Create Recipe
                </Button>
              </div>
            ) : (
              <Button onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
