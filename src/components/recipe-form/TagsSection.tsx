
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";

interface TagsSectionProps {
  form: UseFormReturn<any>;
}

const TagsSection = ({ form }: TagsSectionProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium leading-none">Tags</label>
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
      <div className="flex flex-wrap gap-2">
        {fields.map((field, index) => (
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
                        onClick={() => remove(index)}
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
  );
};

export default TagsSection;
