
import { toast } from "sonner";
import { Recipe } from "@/types";

// This is a mock implementation of OpenAI API
// In a real application, you would use the actual OpenAI client
export interface OpenAIAnalysisResult {
  description: string;
  ingredients: string[];
  instructions: string[];
  cuisine: string;
  title?: string;
  error?: string;
}

export const analyzeRecipeImage = async (imageUrl: string): Promise<OpenAIAnalysisResult> => {
  try {
    console.log("Analyzing image:", imageUrl);
    
    // Check if there's an API key configured
    // const openaiApiKey = localStorage.getItem("openai_api_key");
    const openaiApiKey='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';
    if (!openaiApiKey) {
      console.log("No OpenAI API key found, using mock data");
      // Return mock data if no API key is available
      return mockAnalyzeImage(imageUrl);
    }
    
    // Make a real API call if we have an API key
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using a supported model
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: "Analyze this food image and identify the dish. Return a JSON with title, description, ingredients list, and basic instructions to make it." 
                },
                { 
                  type: "image_url", 
                  image_url: { url: imageUrl } 
                }
              ]
            }
          ],
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        // Try to parse JSON from the response
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/{[\s\S]*}/);
        
        const jsonContent = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
        const result = JSON.parse(jsonContent);
        
        return {
          title: result.title || "Unknown Recipe",
          description: result.description || "",
          ingredients: result.ingredients || [],
          instructions: result.instructions || [],
          cuisine: result.cuisine || "General"
        };
      } catch (parseError) {
        console.error("Failed to parse OpenAI response as JSON:", parseError);
        return mockAnalyzeImage(imageUrl);
      }
    } catch (apiError) {
      console.error("OpenAI API call failed:", apiError);
      return mockAnalyzeImage(imageUrl);
    }
  } catch (error: any) {
    console.error("Error analyzing image with OpenAI:", error);
    return {
      description: "",
      ingredients: [],
      instructions: [],
      cuisine: "",
      error: error.message || "Failed to analyze image"
    };
  }
};

// Function to generate a recipe using OpenAI
export const generateRecipeWithOpenAI = async (prompt: string): Promise<Partial<Recipe>> => {
  try {
    //  localStorage.getItem('openai_api_key')
    const apiKey ='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';
    
    // If no API key is found, use mock data
    if (!apiKey) {
      console.log("No OpenAI API key found, using mock data");
      return generateMockOpenAIRecipe(prompt);
    }
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `You are a world-class chef. Generate a detailed recipe for ${prompt}. The response must be a valid JSON object with the following structure:
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
      console.error("OpenAI API Error:", response.status, response.statusText);
      const errorData = await response.json();
      console.error("OpenAI API Error Details:", errorData);
      return { error: `OpenAI API Error: ${response.statusText}` };
    }

    const data = await response.json();
    const recipeText = data.choices[0].message.content;

    try {
      const jsonMatch = recipeText.match(/```json\n([\s\S]*?)\n```/) || 
                        recipeText.match(/{[\s\S]*}/);
      
      const jsonContent = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : recipeText;
      const recipe = JSON.parse(jsonContent);
      return recipe;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Failed to parse recipe text:", recipeText);
      return {
        error: "Failed to parse recipe from OpenAI response. Please try again or adjust the prompt."
      };
    }
  } catch (error) {
    console.error("OpenAI API Request Error:", error);
    return { error: "Failed to generate recipe. Please check your OpenAI API key and try again." };
  }
};

// Mock function to simulate OpenAI API response
function mockAnalyzeImage(imageUrl: string): OpenAIAnalysisResult {
  console.log("Using mock image analysis for:", imageUrl);
  
  // Different mock results based on the image URL to simulate different analyses
  if (imageUrl.includes("pasta") || Math.random() > 0.7) {
    return {
      title: "Spaghetti Bolognese",
      description: "Classic Italian pasta dish with rich meat sauce",
      ingredients: [
        "1 pound spaghetti",
        "1 pound ground beef",
        "1 onion, diced",
        "3 cloves garlic, minced",
        "1 can (28 oz) crushed tomatoes",
        "2 tablespoons olive oil",
        "1 teaspoon dried oregano",
        "1 teaspoon dried basil",
        "Salt and pepper to taste",
        "Grated Parmesan cheese for serving"
      ],
      instructions: [
        "Heat olive oil in a large pan and sauté onions until translucent",
        "Add garlic and cook for 30 seconds until fragrant",
        "Add ground beef and cook until browned",
        "Pour in crushed tomatoes and add herbs, salt, and pepper",
        "Simmer the sauce for at least 30 minutes, stirring occasionally",
        "Cook spaghetti according to package instructions",
        "Serve sauce over pasta with grated Parmesan cheese"
      ],
      cuisine: "Italian"
    };
  } else if (imageUrl.includes("salad") || Math.random() > 0.5) {
    return {
      title: "Fresh Garden Salad",
      description: "Light and refreshing salad with seasonal vegetables",
      ingredients: [
        "Mixed salad greens",
        "Cherry tomatoes, halved",
        "Cucumber, sliced",
        "Red onion, thinly sliced",
        "Bell pepper, diced",
        "Carrot, julienned",
        "Olive oil",
        "Balsamic vinegar",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Wash and dry all vegetables",
        "Combine all prepared vegetables in a large bowl",
        "Whisk together olive oil, balsamic vinegar, salt, and pepper",
        "Drizzle dressing over salad and toss gently to combine",
        "Serve immediately as a side dish or add protein for a main course"
      ],
      cuisine: "Mediterranean"
    };
  } else {
    return {
      title: "Chocolate Chip Cookies",
      description: "Classic homemade cookies with chocolate chips",
      ingredients: [
        "2 1/4 cups all-purpose flour",
        "1 teaspoon baking soda",
        "1 teaspoon salt",
        "1 cup butter, softened",
        "3/4 cup granulated sugar",
        "3/4 cup packed brown sugar",
        "2 large eggs",
        "2 teaspoons vanilla extract",
        "2 cups chocolate chips"
      ],
      instructions: [
        "Preheat oven to 375°F (190°C)",
        "Mix flour, baking soda, and salt in a bowl",
        "Beat butter, granulated sugar, and brown sugar until creamy",
        "Add eggs one at a time, then stir in vanilla",
        "Gradually blend in the flour mixture",
        "Stir in chocolate chips",
        "Drop by rounded tablespoon onto ungreased baking sheets",
        "Bake for 9 to 11 minutes until golden brown",
        "Cool on baking sheets for 2 minutes, then transfer to wire racks"
      ],
      cuisine: "American"
    };
  }
}

// Function to generate mock recipe data
function generateMockOpenAIRecipe(prompt: string) {
  console.log("Generating mock OpenAI recipe for prompt:", prompt);
  
  const lowerPrompt = prompt.toLowerCase();
  
  // Create a base recipe
  const mockRecipe: Partial<Recipe> = {
    title: "OpenAI's Delicious Creation",
    description: "A mouth-watering dish crafted by OpenAI",
    prepTime: "20",
    cookTime: "30",
    servings: "4",
    difficulty: "Medium",
    ingredients: [
      "2 cups main ingredient",
      "1 cup secondary ingredient",
      "3 tbsp seasoning mix",
      "2 cloves garlic, minced",
      "1 onion, chopped",
      "2 tbsp olive oil",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Prepare all ingredients by washing and chopping as needed.",
      "Heat olive oil in a pan over medium heat.",
      "Add onion and garlic, sauté until fragrant.",
      "Add main ingredient and cook for 5 minutes.",
      "Add secondary ingredient and seasonings.",
      "Simmer for 20 minutes, stirring occasionally.",
      "Adjust salt and pepper to taste before serving."
    ],
    tips: [
      "For extra flavor, add fresh herbs at the end of cooking.",
      "This recipe can be made ahead and reheated when needed."
    ],
    tags: ["quick", "versatile", "delicious"],
    nutrition: {
      calories: "350",
      protein: "15g",
      carbs: "30g",
      fats: "18g"
    }
  };
  
  // Customize based on keywords in the prompt
  if (lowerPrompt.includes("pasta") || lowerPrompt.includes("spaghetti") || lowerPrompt.includes("italian")) {
    mockRecipe.title = "Classic Italian Pasta";
    mockRecipe.description = "A delicious pasta dish inspired by Italian cuisine";
    mockRecipe.ingredients = [
      "12 oz pasta of choice",
      "1 lb ground beef or Italian sausage",
      "1 onion, diced",
      "3 cloves garlic, minced",
      "1 can (28 oz) crushed tomatoes",
      "2 tbsp olive oil",
      "1 tsp dried oregano",
      "1 tsp dried basil",
      "1/2 tsp red pepper flakes (optional)",
      "Salt and pepper to taste",
      "Grated Parmesan cheese for serving"
    ];
    mockRecipe.tags = ["pasta", "italian", "dinner", "classic"];
  } else if (lowerPrompt.includes("chicken") || lowerPrompt.includes("poultry")) {
    mockRecipe.title = "Herb Roasted Chicken";
    mockRecipe.description = "Juicy and flavorful roasted chicken with herbs and vegetables";
    mockRecipe.prepTime = "15";
    mockRecipe.cookTime = "45";
    mockRecipe.ingredients = [
      "4 chicken thighs or breasts",
      "2 tbsp olive oil",
      "2 cloves garlic, minced",
      "1 tbsp fresh rosemary, chopped",
      "1 tbsp fresh thyme, chopped",
      "1 lemon, zested and juiced",
      "1 lb potatoes, chopped",
      "2 carrots, chopped",
      "1 onion, cut into wedges",
      "Salt and pepper to taste"
    ];
    mockRecipe.tags = ["chicken", "dinner", "healthy", "roasted"];
  } else if (lowerPrompt.includes("vegetarian") || lowerPrompt.includes("vegan")) {
    mockRecipe.title = "Hearty Vegetable Stew";
    mockRecipe.description = "A nutritious and satisfying plant-based stew";
    mockRecipe.ingredients = [
      "2 cups mixed vegetables (carrots, celery, potatoes)",
      "1 cup beans or lentils",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "1 can (14 oz) diced tomatoes",
      "4 cups vegetable broth",
      "2 tbsp olive oil",
      "1 tsp dried thyme",
      "1 bay leaf",
      "Salt and pepper to taste"
    ];
    mockRecipe.tags = ["vegetarian", "vegan", "healthy", "stew"];
  } else if (lowerPrompt.includes("dessert") || lowerPrompt.includes("sweet") || lowerPrompt.includes("cake") || lowerPrompt.includes("cookie")) {
    mockRecipe.title = "Decadent Chocolate Dessert";
    mockRecipe.description = "A rich and indulgent treat for chocolate lovers";
    mockRecipe.prepTime = "25";
    mockRecipe.cookTime = "35";
    mockRecipe.ingredients = [
      "1 cup all-purpose flour",
      "1 cup granulated sugar",
      "1/2 cup unsalted butter",
      "2 large eggs",
      "1/2 cup cocoa powder",
      "1 tsp vanilla extract",
      "1/2 tsp baking powder",
      "1/4 tsp salt",
      "1 cup chocolate chips"
    ];
    mockRecipe.tags = ["dessert", "sweet", "chocolate", "baking"];
  } else if (lowerPrompt.includes("indian") || lowerPrompt.includes("curry")) {
    mockRecipe.title = "Flavorful Indian Curry";
    mockRecipe.description = "A fragrant and spicy curry dish";
    mockRecipe.cookTime = "40";
    mockRecipe.ingredients = [
      "2 cups protein of choice (chicken, paneer, chickpeas)",
      "1 onion, finely chopped",
      "2 cloves garlic, minced",
      "1 inch ginger, grated",
      "2 tomatoes, pureed",
      "1/2 cup yogurt",
      "2 tbsp curry powder",
      "1 tsp cumin",
      "1 tsp coriander",
      "1/2 tsp turmeric",
      "1/4 tsp cayenne pepper",
      "2 tbsp oil",
      "Fresh cilantro for garnish",
      "Salt to taste"
    ];
    mockRecipe.tags = ["indian", "curry", "spicy", "flavorful"];
  } else if (lowerPrompt.includes("mexican") || lowerPrompt.includes("taco") || lowerPrompt.includes("burrito")) {
    mockRecipe.title = "Authentic Mexican Fiesta";
    mockRecipe.description = "Bold and vibrant Mexican-inspired dish";
    mockRecipe.ingredients = [
      "1 lb protein of choice (ground beef, chicken, or beans)",
      "1 onion, diced",
      "1 bell pepper, sliced",
      "2 cloves garlic, minced",
      "1 can (14 oz) black beans, drained",
      "1 can (14 oz) diced tomatoes",
      "2 tbsp taco seasoning",
      "1 tsp cumin",
      "1 avocado, sliced",
      "Tortillas or rice for serving",
      "Fresh cilantro and lime for garnish"
    ];
    mockRecipe.tags = ["mexican", "taco", "easy", "quick"];
  }
  
  // Customize recipe title based on prompt
  if (lowerPrompt.length > 0 && !mockRecipe.title.toLowerCase().includes(lowerPrompt)) {
    mockRecipe.title = "Delicious " + prompt.charAt(0).toUpperCase() + prompt.slice(1);
  }
  
  return mockRecipe;
}

// Generate image for a recipe using OpenAI
export const generateRecipeImageWithOpenAI = async (prompt: string): Promise<string> => {
  try {
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      console.log("No OpenAI API key found, using placeholder image");
      return `https://source.unsplash.com/800x600/?${encodeURIComponent(prompt.split(' ').slice(0, 3).join(' '))}`;
    }
    
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: `A beautiful professional food photography image of ${prompt}, no text, high resolution`,
        n: 1,
        size: "1024x1024"
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI Image API Error:", error);
      return `https://source.unsplash.com/800x600/?${encodeURIComponent(prompt.split(' ').slice(0, 3).join(' '))}`;
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(prompt.split(' ').slice(0, 3).join(' '))}`;
  }
};
