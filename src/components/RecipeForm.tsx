import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import VoiceInput from "./ui/voice-input";
import { generateRecipe, RecipeGenerationOptions, generateRecipeImageURL } from "@/lib/groq";
import { cleanRecipeText } from "@/lib/textUtils";
import { useAuth } from "@/contexts/AuthContext";

const recipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  prepTime: z.string().min(1, "Preparation time is required"),
  cookTime: z.string().min(1, "Cooking time is required"),
  servings: z.string().min(1, "Servings is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  ingredients: z.array(
    z.object({
      value: z.string().min(2, "Ingredient must be at least 2 characters"),
    })
  ).min(1, "At least one ingredient is required"),
  instructions: z.array(
    z.object({
      value: z.string().min(5, "Instruction must be at least 5 characters"),
    })
  ).min(1, "At least one instruction is required"),
  tags: z.array(
    z.object({
      value: z.string().min(2, "Tag must be at least 2 characters"),
    })
  ).optional(),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  onSubmit: (data: RecipeFormValues) => void;
  isLoading?: boolean;
}

const RecipeForm = ({ onSubmit, isLoading = false }: RecipeFormProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voicePrompt, setVoicePrompt] = useState("");
  const { user } = useAuth();

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      description: "",
      prepTime: "",
      cookTime: "",
      servings: "",
      difficulty: "Medium",
      ingredients: [{ value: "" }],
      instructions: [{ value: "" }],
      tags: [{ value: "" }],
    },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = 
    useFieldArray({ control: form.control, name: "ingredients" });
    
  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = 
    useFieldArray({ control: form.control, name: "instructions" });
    
  const { fields: tagFields, append: appendTag, remove: removeTag } = 
    useFieldArray({ control: form.control, name: "tags" });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("Image is too large. Maximum size is 10MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const generateFromIngredients = async () => {
    try {
      if (!ingredientsInput.trim()) {
        toast.error("Please enter some ingredients first");
        return;
      }

      setIsGenerating(true);
      toast.info("Generating recipe from ingredients...");

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("openai_api_key")}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful cooking assistant. Generate a recipe based on the given ingredients."
            },
            {
              role: "user",
              content: `Generate a recipe using these ingredients: ${ingredientsInput}. Include a title, description, cooking time, and steps.`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate recipe");
      }

      const data = await response.json();
      const recipe = data.choices[0].message.content;

      // Parse the generated recipe and update form
      const parsedRecipe = parseGeneratedRecipe(recipe);
      updateFormWithRecipe(parsedRecipe);
      
      toast.success("Recipe generated successfully!");
    } catch (error) {
      console.error("Error generating recipe:", error);
      toast.error("Failed to generate recipe. Please check your OpenAI API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromImage = async () => {
    try {
      if (!imageFile) {
        toast.error("Please upload an image first");
        return;
      }

      setIsGenerating(true);
      toast.info("Analyzing image and generating recipe...");

      // Convert image to base64
      const reader = new FileReader();
      const imageBase64Promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageFile);
      });

      const imageBase64 = await imageBase64Promise;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("openai_api_key")}`
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "system",
              content: "You are a helpful cooking assistant. Analyze the image and generate a detailed recipe."
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Generate a recipe based on this food image. Include title, description, ingredients, cooking time, and detailed steps." },
                { type: "image_url", image_url: { url: imageBase64 as string } }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image and generate recipe");
      }

      const data = await response.json();
      const recipe = data.choices[0].message.content;

      // Parse the generated recipe and update form
      const parsedRecipe = parseGeneratedRecipe(recipe);
      updateFormWithRecipe(parsedRecipe);

      toast.success("Recipe generated successfully from image!");
    } catch (error) {
      console.error("Error generating recipe from image:", error);
      toast.error("Failed to generate recipe. Please check your OpenAI API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const parseGeneratedRecipe = (recipeText: string) => {
    // Simple parsing logic - you might want to improve this based on your needs
    const lines = recipeText.split('\n');
    const recipe: any = {
      title: '',
      description: '',
      prepTime: '',
      cookTime: '',
      ingredients: [],
      instructions: []
    };

    let currentSection = '';
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      if (trimmedLine.toLowerCase().includes('title:')) {
        recipe.title = trimmedLine.split(':')[1].trim();
      } else if (trimmedLine.toLowerCase().includes('description:')) {
        recipe.description = trimmedLine.split(':')[1].trim();
      } else if (trimmedLine.toLowerCase().includes('prep time:')) {
        recipe.prepTime = trimmedLine.split(':')[1].trim().replace(/\D/g, '');
      } else if (trimmedLine.toLowerCase().includes('cook time:')) {
        recipe.cookTime = trimmedLine.split(':')[1].trim().replace(/\D/g, '');
      } else if (trimmedLine.toLowerCase().includes('ingredients:')) {
        currentSection = 'ingredients';
      } else if (trimmedLine.toLowerCase().includes('instructions:') || trimmedLine.toLowerCase().includes('steps:')) {
        currentSection = 'instructions';
      } else {
        if (currentSection === 'ingredients') {
          recipe.ingredients.push({ value: trimmedLine });
        } else if (currentSection === 'instructions') {
          recipe.instructions.push({ value: trimmedLine });
        }
      }
    });

    return recipe;
  };

  const updateFormWithRecipe = (recipe: any) => {
    form.setValue('title', recipe.title);
    form.setValue('description', recipe.description);
    form.setValue('prepTime', recipe.prepTime);
    form.setValue('cookTime', recipe.cookTime);

    // Update ingredients
    while (ingredientFields.length > 0) {
      removeIngredient(0);
    }
    recipe.ingredients.forEach((ingredient: { value: string }) => {
      appendIngredient(ingredient);
    });

    // Update instructions
    while (instructionFields.length > 0) {
      removeInstruction(0);
    }
    recipe.instructions.forEach((instruction: { value: string }) => {
      appendInstruction(instruction);
    });
  };

  const handleGenerateRecipe = async () => {
    try {
      if (!voicePrompt.trim()) {
        toast.error("Please provide a prompt to generate a recipe");
        return;
      }
      
      setIsGenerating(true);
      toast.info("Generating recipe...");

      const options: RecipeGenerationOptions = {};
      const response = await generateRecipe(voicePrompt || "Generate a random recipe", options);
      
      // Check for error property in response
      if ('error' in response && response.error) {
        toast.error(response.error as string);
        setIsGenerating(false);
        return;
      }

      // Reset the form first
      form.reset();

      // Apply the generated recipe data to the form
      form.setValue("title", cleanRecipeText(response.title || ""));
      form.setValue("description", cleanRecipeText(response.description || ""));
      form.setValue("prepTime", response.prepTime?.toString() || "");
      form.setValue("cookTime", response.cookTime?.toString() || "");
      form.setValue("servings", response.servings?.toString() || "");
      form.setValue("difficulty", response.difficulty || "Medium");

      // Clear existing fields
      while (ingredientFields.length > 0) {
        removeIngredient(0);
      }
      
      while (instructionFields.length > 0) {
        removeInstruction(0);
      }
      
      while (tagFields.length > 0) {
        removeTag(0);
      }

      // Add new fields
      if (response.ingredients && Array.isArray(response.ingredients)) {
        response.ingredients.forEach((ingredient: string) => {
          appendIngredient({ value: ingredient });
        });
      }

      if (response.instructions && Array.isArray(response.instructions)) {
        response.instructions.forEach((instruction: string) => {
          appendInstruction({ value: instruction });
        });
      }

      if (response.tags && Array.isArray(response.tags)) {
        response.tags.forEach((tag: string) => {
          appendTag({ value: tag });
        });
      }

      toast.success("Recipe generated successfully!");
    } catch (error) {
      console.error("Error generating recipe:", error);
      toast.error("Failed to generate recipe. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setVoicePrompt(transcript);
  };

  const handleFormSubmit = (data: RecipeFormValues) => {
    // Clean text from special characters
    const cleanedData = {
      ...data,
      title: cleanRecipeText(data.title),
      description: cleanRecipeText(data.description),
      ingredients: data.ingredients.map(i => ({ 
        value: cleanRecipeText(i.value) 
      })),
      instructions: data.instructions.map(i => ({ 
        value: cleanRecipeText(i.value) 
      })),
      tags: data.tags?.map(t => ({ 
        value: cleanRecipeText(t.value) 
      }))
    };
    
    onSubmit(cleanedData);
  };

  const clearPrompt = () => {
    setVoicePrompt("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 bg-muted/40 p-4 rounded-lg border">
        <h3 className="text-lg font-medium">Generate Recipe with AI</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Enter Ingredients</label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter ingredients, separated by commas..."
                value={ingredientsInput}
                onChange={(e) => setIngredientsInput(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={generateFromIngredients}
                disabled={isGenerating || !ingredientsInput.trim()}
                className="self-start"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
              </Button>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload Food Image</label>
            <div className="flex flex-col gap-4">
              {imagePreview && (
                <div className="relative w-full h-48">
                  <img
                    src={imagePreview}
                    alt="Food preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                <Button
                  onClick={generateFromImage}
                  disabled={isGenerating || !imageFile}
                  className="self-start"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze & Generate"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter recipe title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a brief description of your recipe"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="prepTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prep Time (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cookTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cook Time (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="servings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servings</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <FormLabel>Ingredients</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendIngredient({ value: "" })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder={`Ingredient ${index + 1}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredientFields.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <FormLabel>Instructions</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendInstruction({ value: "" })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {instructionFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`instructions.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Textarea placeholder={`Step ${index + 1}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInstruction(index)}
                    disabled={instructionFields.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <FormLabel>Tags</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendTag({ value: "" })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tagFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-1">
                  <FormField
                    control={form.control}
                    name={`tags.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center">
                            <Input
                              placeholder="Tag"
                              {...field}
                              className="w-24 h-8 text-sm"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeTag(index)}
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Recipe"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RecipeForm;
