import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

export interface DiscountRule {
  hoursBeforeExpiry: number;
  discountPercent: number;
}

interface DiscountRuleFormProps {
  initialRules?: DiscountRule[];
  onChange?: (rules: DiscountRule[]) => void;
}

function DiscountRuleForm({ initialRules, onChange }: DiscountRuleFormProps) {
  const [rules, setRules] = useState<DiscountRule[]>(
    initialRules ?? [{ hoursBeforeExpiry: 24, discountPercent: 20 }]
  );

  const updateRules = (next: DiscountRule[]) => {
    setRules(next);
    onChange?.(next);
  };

  const addRule = () => {
    updateRules([...rules, { hoursBeforeExpiry: 6, discountPercent: 50 }]);
  };

  const removeRule = (index: number) => {
    updateRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof DiscountRule, value: number) => {
    const next = rules.map((rule, i) =>
      i === index ? { ...rule, [field]: value } : rule
    );
    updateRules(next);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 ern-card-glow">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-lg">Discount rules</h3>
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
          Auto-discount as expiry nears
        </span>
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Set how much discount applies as the item gets closer to expiring.
      </p>

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div
            key={index}
            className="flex items-end gap-4 bg-secondary/50 border border-border rounded-lg p-4"
          >
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1.5">
                Hours before expiry
              </Label>
              <Input
                type="number"
                min={0}
                value={rule.hoursBeforeExpiry}
                onChange={(e) =>
                  updateRule(index, "hoursBeforeExpiry", Number(e.target.value))
                }
                className="font-mono"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1.5">
                Discount %
              </Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={rule.discountPercent}
                onChange={(e) =>
                  updateRule(index, "discountPercent", Number(e.target.value))
                }
                className="font-mono"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRule(index)}
              disabled={rules.length === 1}
              className="text-destructive hover:text-destructive shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addRule}
        className="mt-4 w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add rule
      </Button>
    </div>
  );
}

export default DiscountRuleForm;