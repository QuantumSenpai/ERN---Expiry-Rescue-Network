import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-auto w-fit shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-semibold uppercase tracking-tight whitespace-nowrap transition-all duration-150 select-none [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border border-transparent font-bold",
        secondary: "bg-secondary text-foreground border border-transparent font-semibold",
        outline: "bg-transparent border border-foreground text-foreground font-semibold",
        destructive: "border border-[#9F995B] bg-destructive text-destructive-foreground font-bold",
        warning: "bg-destructive/20 text-foreground border border-[#9F995B]/40 font-bold",
        mint: "bg-accent text-accent-foreground border border-transparent font-bold",
        ghost: "bg-transparent text-muted-foreground",
        link: "text-foreground underline-offset-4 hover:underline p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
