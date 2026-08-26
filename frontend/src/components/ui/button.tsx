import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer font-sans",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:opacity-90 border border-primary rounded-full shadow-none font-bold uppercase",
        outline:
          "border-[1.5px] border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background rounded-full shadow-none font-bold uppercase",
        secondary:
          "bg-secondary text-foreground border border-border hover:bg-secondary/80 rounded-full shadow-none font-bold uppercase",
        ghost:
          "bg-transparent text-foreground hover:bg-foreground/10 rounded-full shadow-none font-bold uppercase",
        destructive:
          "border border-[#9F995B] bg-destructive text-destructive-foreground hover:bg-[#857f44] rounded-full shadow-none font-bold uppercase",
        link:
          "text-foreground underline-offset-4 hover:underline p-0 h-auto font-bold uppercase",
        mint:
          "bg-accent text-accent-foreground border border-transparent hover:bg-[#c2f37c] rounded-full shadow-none font-mono text-xs uppercase font-bold",
      },
      size: {
        default: "h-10 gap-2 px-5 py-2 text-sm rounded-full",
        xs: "h-6 gap-1 rounded-full px-2.5 text-xs",
        sm: "h-8 gap-1.5 rounded-full px-3.5 text-xs",
        lg: "h-12 gap-2.5 px-7 text-base rounded-full",
        icon: "size-9 rounded-full",
        "icon-xs": "size-6 rounded-full",
        "icon-sm": "size-7 rounded-full",
        "icon-lg": "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
