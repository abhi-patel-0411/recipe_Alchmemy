
import { Recipe } from "@/types";

export interface RecipeGenerationOptions {
  aiService?: "groq" | "gemini" | "openai";
  cuisine?: string;
  dietary?: string[];
  mealType?: string;
  ingredients?: string[];
  time?: string;
}

export const generateRecipe = async (prompt: string, options: RecipeGenerationOptions = {}): Promise<Partial<Recipe>> => {
  const { aiService = "groq" } = options;

  try {
    if (aiService === "groq") {
      return await generateRecipeGroq(prompt, options);
    } else if (aiService === "gemini") {
      const { generateRecipeWithGemini } = await import('./gemini');
      return await generateRecipeWithGemini(prompt, options);
    } else if (aiService === "openai") {
      const { generateRecipeWithOpenAI } = await import('./openai');
      return await generateRecipeWithOpenAI(prompt);
    } else {
      return { error: "Invalid AI service selected." };
    }
  } catch (error: any) {
    console.error("Error in generateRecipe:", error);
    return { 
      error: `Failed to generate recipe: ${error.message || "Unknown error"}` 
    };
  }
};

const generateRecipeGroq = async (prompt: string, options: RecipeGenerationOptions = {}): Promise<Partial<Recipe>> => {
  try {
    // const apiKey = localStorage.getItem('groq_api_key');
    const apiKey='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';
    
    // If we don't have an API key, return mock data
    if (!apiKey) {
      console.log("No Groq API key found, using mock data");
      return generateMockRecipe(prompt);
    }
    
    console.log("Calling Groq API with prompt:", prompt);
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // Updated to a supported model
        messages: [{
          role: "user",
          content: `You are a world-class chef. Generate a detailed recipe based on the following description: ${prompt}. Include a title, description, ingredients (with quantities), step-by-step instructions, preparation time, cook time, servings, difficulty (Easy, Medium, Hard), optional tips, and tags. Format the response as a JSON object with the following structure:
          {
            "title": "Recipe Title",
            "description": "Brief description",
            "prepTime": "30",
            "cookTime": "45",
            "servings": "4",
            "difficulty": "Easy", // or Medium or Hard
            "ingredients": ["1 cup ingredient 1", "2 tbsp ingredient 2", ...],
            "instructions": ["Step 1 description", "Step 2 description", ...],
            "tips": ["Tip 1", "Tip 2", ...],
            "tags": ["tag1", "tag2", ...],
            "nutrition": {
              "calories": "350",
              "protein": "15g",
              "carbs": "30g",
              "fats": "18g"
            }
          }`
        }],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      console.error("Groq API Error:", response.status, response.statusText);
      const errorData = await response.json();
      console.error("Groq API Error Details:", errorData);
      return { error: `Groq API Error: ${response.statusText}` };
    }

    const data = await response.json();
    const recipeText = data.choices[0].message.content;

    try {
      // Extract JSON from the response
      const jsonMatch = recipeText.match(/```json\n([\s\S]*?)\n```/) || 
                        recipeText.match(/{[\s\S]*}/);
      
      const jsonContent = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : recipeText;
      const recipe = JSON.parse(jsonContent);
      
      // Add the AI service used
      recipe.generatedBy = "groq";
      
      return recipe;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Failed to parse recipe text:", recipeText);
      return {
        error: "Failed to parse recipe from AI response. Please try again or adjust the prompt."
      };
    }

  } catch (error: any) {
    console.error("Groq API Request Error:", error);
    return { error: `Failed to generate recipe: ${error.message || "Unknown error"}` };
  }
};

// Helper function to generate mock recipe data when no API key is available
function generateMockRecipe(prompt: string): Partial<Recipe> {
  console.log("Generating mock recipe for:", prompt);
  
  const lowerPrompt = prompt.toLowerCase();
  
  // Base mock recipe
  const mockRecipe: Partial<Recipe> = {
    title: "Delicious Mock Recipe",
    description: "This is a mock recipe generated because no API key was provided.",
    prepTime: "15",
    cookTime: "30",
    servings: "4",
    difficulty: "Medium",
    ingredients: [
      "2 cups ingredient one",
      "1 tablespoon ingredient two",
      "3 units ingredient three",
      "1/2 cup ingredient four",
      "Salt and pepper to taste"
    ],
    instructions: [
      "First, prepare all ingredients.",
      "Mix ingredient one and two in a bowl.",
      "Add ingredient three and stir well.",
      "Cook for 30 minutes at medium heat.",
      "Season with salt and pepper before serving."
    ],
    tips: [
      "You can substitute ingredient two with alternative.",
      "For a spicier version, add some chili."
    ],
    tags: ["quick", "easy", "mock", "generated"],
    nutrition: {
      calories: "350",
      protein: "15g",
      carbs: "30g",
      fats: "18g"
    },
    generatedBy: "mock"
  };
  
  // Customize based on prompt
  if (lowerPrompt.includes("pasta") || lowerPrompt.includes("italian")) {
    mockRecipe.title = "Italian Pasta Delight";
    mockRecipe.tags = ["pasta", "italian", "dinner"];
  } else if (lowerPrompt.includes("chicken")) {
    mockRecipe.title = "Herb Roasted Chicken";
    mockRecipe.tags = ["chicken", "protein", "dinner"];
  } else if (lowerPrompt.includes("cake") || lowerPrompt.includes("dessert")) {
    mockRecipe.title = "Sweet Cake Delight";
    mockRecipe.tags = ["dessert", "sweet", "baking"];
  } else if (lowerPrompt.includes("vegetarian") || lowerPrompt.includes("vegan")) {
    mockRecipe.title = "Plant-Powered Bowl";
    mockRecipe.tags = ["vegetarian", "healthy", "plant-based"];
  } else if (prompt.length > 3) {
    // Use the prompt itself for the title if it's something specific
    mockRecipe.title = prompt.charAt(0).toUpperCase() + prompt.slice(1);
  }
  
  return mockRecipe;
}

export const generateRecipeImageURL = (recipeName: string): string => {
  const encodedRecipeName = encodeURIComponent(recipeName);
  // return `https://source.unsplash.com/400x300/?food,${encodedRecipeName}`;
  return "./public/pl.png";

};

// Add the getRandomPlaceholderImage function
export const getRandomPlaceholderImage = (): string => {
  const imageTypes = [
    "food", "meal", "dish", "cuisine", "recipe",
    "cooking", "baking", "breakfast", "lunch", "dinner"
  ];
  const randomType = imageTypes[Math.floor(Math.random() * imageTypes.length)];
  const randomId = Math.floor(Math.random() * 100);
  // return `https://source.unsplash.com/400x300/?${randomType},${randomId}`;
  return "./public/pl.png";

};
