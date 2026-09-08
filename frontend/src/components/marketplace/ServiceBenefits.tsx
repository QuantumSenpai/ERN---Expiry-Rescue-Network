import { Truck, Headphones, CheckCircle2, CreditCard } from "lucide-react";

export default function ServiceBenefits() {
  const benefits = [
    {
      icon: Truck,
      title: "FREE DELIVERY",
      subtitle: "On rescue orders above ₹500",
    },
    {
      icon: Headphones,
      title: "CUSTOMER SUPPORT",
      subtitle: "Prompt help with any questions",
    },
    {
      icon: CheckCircle2,
      title: "QUALITY CHECKED",
      subtitle: "Expiry checked before packing",
    },
    {
      icon: CreditCard,
      title: "SAFE PAYMENTS",
      subtitle: "UPI, Cards & Cash on Delivery",
    },
  ];

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 border-b border-border bg-card text-foreground font-body">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="p-4 rounded-2xl bg-background border border-border flex items-center gap-3.5 shadow-none"
              >
                <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 font-mono">
                  <h4 className="text-xs uppercase font-bold text-foreground tracking-tight truncate">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-sans truncate">
                    {b.subtitle}
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
