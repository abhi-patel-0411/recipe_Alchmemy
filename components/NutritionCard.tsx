
import { ChevronDown, Activity, Utensils, Flame, Beef } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface NutritionCardProps {
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  };
}

const NutritionCard = ({ nutrition }: NutritionCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Extract numeric values for progress bars
  const getNumericValue = (value: string) => {
    const numMatch = value.match(/\d+/);
    return numMatch ? parseInt(numMatch[0]) : 0;
  };

  const caloriesNum = getNumericValue(nutrition.calories);
  const proteinNum = getNumericValue(nutrition.protein);
  const carbsNum = getNumericValue(nutrition.carbs);
  const fatsNum = getNumericValue(nutrition.fats);
  
  // Calculate percentages for visual representation (based on common daily values)
  const proteinPercentage = Math.min((proteinNum / 50) * 100, 100);
  const carbsPercentage = Math.min((carbsNum / 300) * 100, 100);
  const fatsPercentage = Math.min((fatsNum / 65) * 100, 100);

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="text-recipe-primary w-5 h-5" />
            <h3 className="text-xl font-semibold">Nutrition Facts</h3>
          </div>
          <CollapsibleTrigger asChild>
            <button className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
        </div>
        
        <div className="mt-6 py-4 border-t border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Flame className="text-recipe-accent w-5 h-5" />
              <span className="font-medium">Calories</span>
            </div>
            <span className="text-lg font-semibold">{nutrition.calories}</span>
          </div>
        </div>
        
        <CollapsibleContent>
          <div className="space-y-5 pt-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Beef className="text-recipe-secondary w-4 h-4" />
                  <span>Protein</span>
                </div>
                <span className="font-medium">{nutrition.protein}</span>
              </div>
              <Progress 
                value={proteinPercentage} 
                className="h-2 bg-gray-200 dark:bg-gray-700" 
                style={{ "--progress-background": "var(--recipe-secondary)" } as React.CSSProperties}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Utensils className="text-recipe-primary w-4 h-4" />
                  <span>Carbs</span>
                </div>
                <span className="font-medium">{nutrition.carbs}</span>
              </div>
              <Progress 
                value={carbsPercentage} 
                className="h-2 bg-gray-200 dark:bg-gray-700" 
                style={{ "--progress-background": "var(--recipe-primary)" } as React.CSSProperties}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="text-recipe-accent w-4 h-4" />
                  <span>Fats</span>
                </div>
                <span className="font-medium">{nutrition.fats}</span>
              </div>
              <Progress 
                value={fatsPercentage} 
                className="h-2 bg-gray-200 dark:bg-gray-700" 
                style={{ "--progress-background": "var(--recipe-accent)" } as React.CSSProperties}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default NutritionCard;
