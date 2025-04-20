
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

interface InstructionsSectionProps {
  form: UseFormReturn<any>;
}

const InstructionsSection = ({ form }: InstructionsSectionProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instructions",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium leading-none">Instructions</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ value: "" })}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {fields.map((field, index) => (
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
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructionsSection;
