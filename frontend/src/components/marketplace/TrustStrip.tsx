import { Calendar, Tag, Layers, CheckCircle2, Headphones } from "lucide-react";

export default function TrustStrip() {
  const trustItems = [
    {
      icon: Calendar,
      title: "EXPIRY DATES SHOWN",
      subtitle: "Exact days left on every item",
    },
    {
      icon: Tag,
      title: "CLEAR SAVINGS",
      subtitle: "See ₹ savings before checkout",
    },
    {
      icon: Layers,
      title: "BATCH CHOICES",
      subtitle: "Choose fresh or rescue batches",
    },
    {
      icon: CheckCircle2,
      title: "STOCK AVAILABILITY",
      subtitle: "Clear quantity limits on deals",
    },
    {
      icon: Headphones,
      title: "HELP & SUPPORT",
      subtitle: "Prompt help with any order",
    },
  ];

  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border bg-card text-foreground font-body">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-3 p-2 rounded-xl"
              >
                <div className="size-8 sm:size-9 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 font-mono">
                  <h4 className="text-[11px] sm:text-xs uppercase font-bold text-foreground tracking-tight truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10.5px] text-muted-foreground font-sans truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
