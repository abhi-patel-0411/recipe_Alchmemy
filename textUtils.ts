
/**
 * Cleans text from special characters that might cause display issues
 * @param text The text to clean
 * @returns The cleaned text
 */
export function cleanRecipeText(text: string): string {
  if (!text) return '';
  
  // Replace common problematic characters while preserving important ones
  return text
    .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
    .replace(/[\u2013\u2014]/g, '-') // En-dash and em-dash
    .replace(/\u2026/g, '...') // Ellipsis
    .replace(/[^\x00-\x7F]/g, '') // Remove other non-ASCII characters
    .trim();
}

/**
 * Formats recipe instructions by removing numbering and cleaning text
 * @param instruction The instruction text to format
 * @returns The formatted instruction
 */
export function formatInstruction(instruction: string): string {
  if (!instruction) return '';
  
  // Remove numbering at the beginning (e.g., "1. " or "Step 1: ")
  const withoutNumbering = instruction.replace(/^(\d+\.|\s*Step\s*\d+:|\s*\(\d+\)|\s*•)\s*/i, '');
  
  // Clean any special characters but preserve all regular characters
  return cleanRecipeText(withoutNumbering);
}

/**
 * Formats recipe ingredients by removing bullets and cleaning text
 * @param ingredient The ingredient text to format
 * @returns The formatted ingredient
 */
export function formatIngredient(ingredient: string): string {
  if (!ingredient) return '';
  
  // Remove bullets at the beginning
  const withoutBullets = ingredient.replace(/^(\s*•|\s*\*|\s*-|\s*·)\s*/i, '');
  
  // Clean any special characters but preserve all regular characters
  return cleanRecipeText(withoutBullets);
}

/**
 * Extracts numbers from string (e.g., for nutrition values)
 * @param text Text containing numbers
 * @returns Number or 0 if not found
 */
export function extractNumber(text: string): number {
  if (!text) return 0;
  
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

/**
 * Generates a quick recipe suggestion based on partial input
 * @param input Partial recipe name or ingredients
 * @returns Suggested recipe names array
 */
export function generateRecipeSuggestions(input: string): string[] {
  if (!input || input.trim().length < 2) return [];
  
  const cleanInput = input.toLowerCase().trim();
  
  // Common base recipes to suggest from
  const baseRecipes = [
    "Pasta", "Pizza", "Salad", "Soup", "Stew", "Curry", 
    "Stir-fry", "Casserole", "Roast", "Burger", "Sandwich",
    "Taco", "Burrito", "Bowl", "Risotto", "Paella"
  ];
  
  // Common ingredients that could be detected
  const ingredients: Record<string, string[]> = {
    "chicken": ["Chicken Alfredo", "Chicken Parmesan", "Roast Chicken", "Chicken Curry", "Chicken Soup"],
    "beef": ["Beef Stew", "Beef Tacos", "Beef Stir-fry", "Beef Burger", "Beef Lasagna"],
    "pork": ["Pulled Pork", "Pork Chops", "Pork Stir-fry", "Pork Roast", "Pork Tenderloin"],
    "fish": ["Grilled Fish", "Fish Tacos", "Fish Curry", "Baked Fish", "Fish Stew"],
    "vegetable": ["Vegetable Stir-fry", "Roasted Vegetables", "Vegetable Soup", "Vegetable Curry", "Vegetable Pasta"],
    "pasta": ["Pasta Carbonara", "Pasta Alfredo", "Pasta Bolognese", "Pasta Primavera", "Pasta Salad"],
    "rice": ["Fried Rice", "Rice Bowl", "Rice Pilaf", "Risotto", "Rice Pudding"],
    "potato": ["Mashed Potatoes", "Roasted Potatoes", "Potato Soup", "Potato Salad", "Potato Curry"]
  };
  
  const suggestions: string[] = [];
  
  // Check if input matches any ingredient keywords
  Object.entries(ingredients).forEach(([key, recipes]) => {
    if (cleanInput.includes(key)) {
      suggestions.push(...recipes);
    }
  });
  
  // If no ingredient matches, suggest based on dish type
  if (suggestions.length === 0) {
    baseRecipes.forEach(base => {
      if (base.toLowerCase().includes(cleanInput)) {
        suggestions.push(base);
        suggestions.push(`${base} with Vegetables`);
        suggestions.push(`${base} with Chicken`);
      }
    });
  }
  
  // If still no suggestions, create generic ones
  if (suggestions.length === 0) {
    suggestions.push(`${input} Special`);
    suggestions.push(`Homemade ${input}`);
    suggestions.push(`Traditional ${input}`);
    suggestions.push(`Quick ${input}`);
    suggestions.push(`${input} Delight`);
  }
  
  // Return unique suggestions, up to 5
  return [...new Set(suggestions)].slice(0, 5);
}
