
import { cleanRecipeText, formatIngredient, formatInstruction } from "./textUtils";
import { RecipeGenerationOptions } from "./groq";

// Function to generate a recipe using Google's Gemini API
export async function generateRecipeWithGemini(prompt: string, options: RecipeGenerationOptions = {}) {
  try {
    // localStorage.getItem('gemini_api_key')
    const apiKey = 'AIzaSyAYX2tFX0cZBUs4D3d9mjp9rNBrGGDxG5Y';
    
    // If we don't have an API key, return mock data
    if (!apiKey) {
      console.log("No Gemini API key found, using mock data");
      return generateMockGeminiRecipe(prompt);
    }
    
    // Build the prompt
    let enhancedPrompt = `Generate a detailed recipe with the following format:
    {
      "title": "Recipe Title",
      "description": "Brief description",
      "prepTime": "Preparation time in minutes",
      "cookTime": "Cooking time in minutes",
      "servings": "Number of servings",
      "difficulty": "Easy/Medium/Hard",
      "ingredients": ["ingredient 1", "ingredient 2", ...],
      "instructions": ["step 1", "step 2", ...],
      "tips": ["tip 1", "tip 2", ...],
      "tags": ["tag1", "tag2", ...],
      "nutrition": {
        "calories": "000",
        "protein": "00g",
        "carbs": "00g",
        "fats": "00g"
      }
    }
    
    User request: ${prompt}
    `;

    // Add any specified options to the prompt
    if (options.cuisine) {
      enhancedPrompt += `\nCuisine: ${options.cuisine}`;
    }
    
    if (options.dietary && options.dietary.length > 0) {
      enhancedPrompt += `\nDietary preferences: ${options.dietary.join(', ')}`;
    }
    
    if (options.mealType) {
      enhancedPrompt += `\nMeal type: ${options.mealType}`;
    }
    
    if (options.ingredients && options.ingredients.length > 0) {
      enhancedPrompt += `\nMust include ingredients: ${options.ingredients.join(', ')}`;
    }
    
    if (options.time) {
      enhancedPrompt += `\nTime constraint: ${options.time}`;
    }

    try {
      // Make an API request to Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: enhancedPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const contentText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!contentText) {
        throw new Error("No content returned from Gemini API");
      }

      // Extract JSON from the response
      const jsonMatch = contentText.match(/```json\n([\s\S]*?)\n```/) || 
                        contentText.match(/{[\s\S]*}/);
      
      if (!jsonMatch) {
        throw new Error("Could not find JSON in Gemini response");
      }
      
      const jsonContent = jsonMatch[1] || jsonMatch[0];
      const parsedRecipe = JSON.parse(jsonContent);
      
      // Clean the text from special characters
      if (parsedRecipe.ingredients && Array.isArray(parsedRecipe.ingredients)) {
        parsedRecipe.ingredients = parsedRecipe.ingredients.map((ingredient: string) => 
          formatIngredient(ingredient)
        );
      }
      
      if (parsedRecipe.instructions && Array.isArray(parsedRecipe.instructions)) {
        parsedRecipe.instructions = parsedRecipe.instructions.map((instruction: string) => 
          formatInstruction(instruction)
        );
      }
      
      if (parsedRecipe.tips && Array.isArray(parsedRecipe.tips)) {
        parsedRecipe.tips = parsedRecipe.tips.map((tip: string) => 
          cleanRecipeText(tip)
        );
      }
      
      if (parsedRecipe.title) {
        parsedRecipe.title = cleanRecipeText(parsedRecipe.title);
      }
      
      if (parsedRecipe.description) {
        parsedRecipe.description = cleanRecipeText(parsedRecipe.description);
      }
      
      // Add the AI service used
      parsedRecipe.generatedBy = "Google Gemini";
      
      return parsedRecipe;
    } catch (error) {
      console.error("Error with Gemini API:", error);
      // Fall back to mock data if the API call fails
      return generateMockGeminiRecipe(prompt);
    }
  } catch (error) {
    console.error("Error generating recipe with Gemini:", error);
    return { error: "Failed to generate recipe with Gemini" };
  }
}

// Function to generate mock recipe data
function generateMockGeminiRecipe(prompt: string) {
  console.log("Generating mock Gemini recipe for prompt:", prompt);
  
  // Base mock recipe
  const mockRecipe = {
    title: "Gemini's Special Dish",
    description: "A delicious recipe created by Google's Gemini AI",
    prepTime: "15",
    cookTime: "25",
    servings: "4",
    difficulty: "Medium",
    ingredients: [
      "2 cups mixed vegetables",
      "1 lb protein of choice",
      "3 tbsp olive oil",
      "2 cloves garlic, minced",
      "1 onion, diced",
      "1 tsp salt",
      "1/2 tsp black pepper",
      "1 cup broth or stock",
      "Fresh herbs for garnish"
    ],
    instructions: [
      "Heat olive oil in a large pan over medium heat.",
      "Add garlic and onion, sauté until fragrant, about 2 minutes.",
      "Add protein and cook until browned on all sides.",
      "Add vegetables and cook for 5 minutes, stirring occasionally.",
      "Pour in broth, bring to a simmer, and cover.",
      "Cook for 15 minutes or until everything is tender.",
      "Season with salt and pepper to taste.",
      "Garnish with fresh herbs before serving."
    ],
    tips: [
      "You can substitute any protein you prefer.",
      "Add your favorite spices to customize the flavor profile.",
      "This recipe works well with meal prep and reheats beautifully."
    ],
    tags: ["quick", "versatile", "healthy", "dinner"],
    nutrition: {
      calories: "380",
      protein: "25g",
      carbs: "20g",
      fats: "22g"
    },
    generatedBy: "Google Gemini (Mock)"
  };

  // Customize based on keywords in the prompt
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("breakfast") || lowerPrompt.includes("morning")) {
    mockRecipe.title = "Gemini's Morning Glory Breakfast Bowl";
    mockRecipe.description = "A nutritious and energizing breakfast to start your day";
    mockRecipe.tags = ["breakfast", "healthy", "quick", "morning"];
    mockRecipe.prepTime = "10";
    mockRecipe.cookTime = "5";
  } else if (lowerPrompt.includes("dessert") || lowerPrompt.includes("sweet")) {
    mockRecipe.title = "Gemini's Cloud Nine Dessert";
    mockRecipe.description = "A heavenly sweet treat that melts in your mouth";
    mockRecipe.tags = ["dessert", "sweet", "indulgent", "treat"];
    mockRecipe.difficulty = "Easy";
  } else if (lowerPrompt.includes("vegetarian") || lowerPrompt.includes("vegan")) {
    mockRecipe.title = "Gemini's Plant-Powered Plate";
    mockRecipe.description = "A satisfying and flavorful plant-based dish";
    mockRecipe.tags = ["vegetarian", "vegan", "plant-based", "healthy"];
    mockRecipe.ingredients = [
      "1 block firm tofu, pressed and cubed",
      "2 cups mixed vegetables",
      "3 tbsp olive oil",
      "2 cloves garlic, minced",
      "1 onion, diced",
      "1 tsp salt",
      "1/2 tsp black pepper",
      "2 tbsp soy sauce",
      "1 tbsp maple syrup",
      "1 tsp smoked paprika"
    ];
  }
  
  return mockRecipe;
}
