
import { useState, useEffect } from "react";
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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cleanRecipeText } from "@/lib/textUtils";

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
  onImageGenerated?: (imageUrl: string) => void;
}

const RecipeForm = ({ onSubmit, isLoading = false, onImageGenerated }: RecipeFormProps) => {
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

  // Load temporary recipe data if it exists
  useEffect(() => {
    const tempRecipeJson = localStorage.getItem('temp_recipe');
    if (tempRecipeJson) {
      try {
        const tempRecipe = JSON.parse(tempRecipeJson);
        
        form.reset({
          title: tempRecipe.title || "",
          description: tempRecipe.description || "",
          prepTime: tempRecipe.prepTime?.toString() || "",
          cookTime: tempRecipe.cookTime?.toString() || "",
          servings: tempRecipe.servings?.toString() || "",
          difficulty: tempRecipe.difficulty || "Medium",
          ingredients: Array.isArray(tempRecipe.ingredients) ? 
            tempRecipe.ingredients.map((i: string) => ({ value: i })) : 
            [{ value: "" }],
          instructions: Array.isArray(tempRecipe.instructions) ? 
            tempRecipe.instructions.map((i: string) => ({ value: i })) : 
            [{ value: "" }],
          tags: Array.isArray(tempRecipe.tags) ? 
            tempRecipe.tags.map((t: string) => ({ value: t })) : 
            [{ value: "" }],
        });
        
        if (tempRecipe.imageUrl && onImageGenerated) {
          onImageGenerated(tempRecipe.imageUrl);
        }
        
        toast.info("Loaded recipe from AI generation");
      } catch (error) {
        console.error("Error parsing temporary recipe:", error);
      }
    }
  }, [form, onImageGenerated]);

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = 
    useFieldArray({ control: form.control, name: "ingredients" });
    
  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = 
    useFieldArray({ control: form.control, name: "instructions" });
    
  const { fields: tagFields, append: appendTag, remove: removeTag } = 
    useFieldArray({ control: form.control, name: "tags" });

  const handleFormSubmit = (data: RecipeFormValues) => {
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

  return (
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
  );
};

export default RecipeForm;
