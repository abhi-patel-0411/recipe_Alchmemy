
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/types";
import { getRandomPlaceholderImage } from "@/lib/groq";
import Navbar from "@/components/Navbar";
import VoiceInput from "@/components/ui/voice-input";
import { ChefHat, ArrowRight, Search, Utensils } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAuth } from "@/contexts/AuthContext";

// Mock recipes for demo
const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Creamy Garlic Parmesan Pasta",
    description: "A quick and easy pasta dish that's perfect for weeknight dinners.",
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
    comments: []
  },
  {
    id: "2",
    title: "Avocado & Egg Breakfast Toast",
    description: "Start your day with this nutritious and delicious breakfast toast.",
    imageUrl: getRandomPlaceholderImage(),
    prepTime: "5",
    cookTime: "10",
    servings: "1",
    difficulty: "Easy",
    ingredients: [
      "2 slices whole grain bread",
      "1 ripe avocado, mashed",
      "2 eggs",
      "Salt and pepper to taste",
      "Red pepper flakes (optional)",
      "Fresh herbs (optional)"
    ],
    instructions: [
      "Toast the bread slices until golden and crisp.",
      "While bread is toasting, fry or poach the eggs to your preference.",
      "Spread the mashed avocado evenly on the toast.",
      "Top each toast with an egg.",
      "Season with salt, pepper, and red pepper flakes if desired.",
      "Garnish with fresh herbs if using."
    ],
    tips: [
      "Add a squeeze of lemon juice to the avocado to prevent browning and add brightness.",
      "Try adding a thin slice of tomato or some microgreens for extra nutrition and flavor.",
      "For extra richness, drizzle with olive oil before serving."
    ],
    tags: ["breakfast", "healthy", "vegetarian", "quick"],
    nutrition: {
      calories: "380",
      protein: "15g",
      carbs: "30g",
      fats: "22g"
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
    likes: 28,
    liked: false,
    comments: []
  },
  {
    id: "3",
    title: "Spicy Thai Basil Chicken",
    description: "A flavorful and aromatic Thai stir-fry that comes together in minutes.",
    imageUrl: getRandomPlaceholderImage(),
    prepTime: "15",
    cookTime: "10",
    servings: "4",
    difficulty: "Medium",
    ingredients: [
      "1 lb ground chicken",
      "4 cloves garlic, minced",
      "2-3 Thai chili peppers, finely chopped",
      "1 shallot, thinly sliced",
      "2 tbsp oil",
      "1 tbsp oyster sauce",
      "1 tbsp soy sauce",
      "1 tsp fish sauce",
      "1 tsp sugar",
      "1 cup Thai basil leaves",
      "Steamed rice for serving"
    ],
    instructions: [
      "Heat oil in a wok or large skillet over high heat.",
      "Add garlic, chili peppers, and shallots. Stir-fry for 30 seconds until fragrant.",
      "Add ground chicken and cook, breaking it up with a spatula, until no longer pink.",
      "Mix together oyster sauce, soy sauce, fish sauce, and sugar in a small bowl, then pour over the chicken.",
      "Cook for another 1-2 minutes until the sauce is reduced slightly.",
      "Turn off the heat and stir in the basil leaves until wilted.",
      "Serve immediately over steamed rice."
    ],
    tips: [
      "If you can't find Thai basil, Italian basil can work in a pinch, though the flavor will be different.",
      "Adjust the number of chili peppers based on your spice preference.",
      "For extra flavor, add a fried egg on top."
    ],
    tags: ["thai", "spicy", "chicken", "dinner"],
    nutrition: {
      calories: "320",
      protein: "25g",
      carbs: "12g",
      fats: "18g"
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
    likes: 35,
    liked: false,
    comments: []
  }
];

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [voicePrompt, setVoicePrompt] = useState("");
  
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out"
    });
  }, []);

  const handleVoiceResult = (transcript: string) => {
    setVoicePrompt(transcript);
    if (transcript) {
      // Route to search page with voice input
      window.location.href = `/search?q=${encodeURIComponent(transcript)}`;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput)}`;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 md:pt-32 md:pb-20 bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2" data-aos="fade-right">
              <div className="flex items-center mb-4">
                <ChefHat className="h-6 w-6 text-recipe-primary mr-2" />
                <span className="text-sm font-medium text-recipe-primary">RECIPE ALCHMEMY</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                <span className="gradient-text">AI-Powered Recipe Generator</span> for Your Perfect Meal
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Discover, create, and share amazing recipes using our voice-enabled AI. Simply speak your cravings and let Recipe Alchmemy do the rest!
              </p>
              
              <form onSubmit={handleSearchSubmit} className="mb-6">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search for recipes or ingredients..."
                    className="w-full pl-10 pr-28 py-3 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-recipe-primary"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <div className="absolute right-2">
                    <VoiceInput 
                      onResult={handleVoiceResult}
                      className="mr-2"
                    />
                  </div>
                </div>
              </form>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-recipe-primary hover:bg-recipe-primary/90" size="lg" asChild>
                  <Link to="/explore">
                    Explore Recipes <Utensils className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild>
                  <Link to={isAuthenticated ? "/create" : "/register"}>
                    {isAuthenticated ? "Create Recipe" : "Sign Up"} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2" data-aos="fade-left" data-aos-delay="100">
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80"
                    alt="Food"
                    className="w-full h-48 md:h-64 object-cover rounded-lg transform translate-y-4"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80"
                    alt="Food"
                    className="w-full h-48 md:h-64 object-cover rounded-lg"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=500&q=80"
                    alt="Food"
                    className="w-full h-48 md:h-64 object-cover rounded-lg"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=500&q=80"
                    alt="Food"
                    className="w-full h-48 md:h-64 object-cover rounded-lg transform translate-y-4"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-recipe-primary/20 to-recipe-secondary/20 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Recipes Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-display font-semibold" data-aos="fade-up">
              Featured Recipes
            </h2>
            <Button variant="ghost" className="text-recipe-primary" asChild data-aos="fade-up" data-aos-delay="100">
              <Link to="/explore">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockRecipes.map((recipe, index) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Feature Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">
              How Recipe Alchmemy Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Our AI-powered platform makes cooking and recipe sharing easier than ever before
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm" data-aos="fade-up" data-aos-delay="100">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-recipe-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Voice-Powered Search</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Simply speak into your device to search for recipes or describe the meal you want to create.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm" data-aos="fade-up" data-aos-delay="200">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-recipe-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Recipe Generation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our advanced AI creates personalized recipes based on your preferences, ingredients, and dietary needs.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm" data-aos="fade-up" data-aos-delay="300">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-recipe-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Social Sharing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share your favorite recipes with friends and family on Instagram, WhatsApp, and Facebook.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-recipe-primary to-recipe-secondary rounded-2xl p-8 md:p-12 text-white" data-aos="zoom-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                  Ready to create culinary magic?
                </h2>
                <p className="text-white/90">
                  Join our community of food lovers and start creating amazing recipes today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" className="bg-white text-recipe-primary hover:bg-white/90" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link to="/explore">Explore Recipes</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-gray-100 dark:bg-gray-800/80">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link to="/" className="flex items-center">
                <ChefHat className="h-6 w-6 text-recipe-primary mr-2" />
                <span className="font-display font-bold text-xl">Recipe Alchmemy</span>
              </Link>
              <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md">
                AI-powered recipe generator and sharing platform for food enthusiasts and home cooks.
              </p>
            </div>
            <div className="flex flex-wrap gap-8">
              <div>
                <h3 className="font-semibold mb-3">Explore</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-recipe-primary">Home</Link></li>
                  <li><Link to="/explore" className="text-gray-600 dark:text-gray-300 hover:text-recipe-primary">Recipes</Link></li>
                  <li><Link to="/create" className="text-gray-600 dark:text-gray-300 hover:text-recipe-primary">Create</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Account</h3>
                <ul className="space-y-2">
                  <li><Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-recipe-primary">Login</Link></li>
                  <li><Link to="/register" className="text-gray-600 dark:text-gray-300 hover:text-recipe-primary">Sign Up</Link></li>
                  <li><Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-recipe-primary">Profile</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Legal</h3>
                <ul className="space-y-2">
                  <li><Link to="/terms" className="text-gray-600 dark:text-gray-300 hover:text-recipe-primary">Terms</Link></li>
                  <li><Link to="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-recipe-primary">Privacy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              © {new Date().getFullYear()} Recipe Alchmemy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
