
export interface User {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string;
  createdAt: string;
  bio?: string;
  website?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  author: User;
  recipeId: string;
  createdAt: string;
}

export interface Nutrition {
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients: string[];
  instructions: string[];
  tips: string[];
  tags: string[];
  userId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  likes: number;
  liked?: boolean;
  comments: Comment[];
  nutrition: Nutrition;
  generatedBy?: "groq" | "gemini" | "openai" | "mock" | string;
  error?: string; // Added error property for API error handling
}
