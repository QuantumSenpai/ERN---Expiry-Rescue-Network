import { useState } from "react";
import { Bell, CheckCircle2, Tag, ShoppingBag, Clock, X } from "lucide-react";

interface CustomerAlert {
  id: string;
  type: "deal" | "order" | "expiry" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_ALERTS: CustomerAlert[] = [
  {
    id: "ca-1",
    type: "deal",
    title: "Flash Deal Ending Soon",
    message: "Organic Produce Selection Box — 50% OFF expires in 1h 40m. Grab it before it's gone!",
    time: "2 mins ago",
    read: false,
  },
  {
    id: "ca-2",
    type: "order",
    title: "Order Confirmed",
    message: "Your order #ORD-8841 has been confirmed and is being prepared for pickup.",
    time: "18 mins ago",
    read: false,
  },
  {
    id: "ca-3",
    type: "deal",
    title: "New Rescue Deal Near You",
    message: "Farm Fresh Dairy Combo at 60% OFF — Just 12 units left at City Center.",
    time: "45 mins ago",
    read: true,
  },
  {
    id: "ca-4",
    type: "expiry",
    title: "Saved Item Going on Clearance",
    message: "Artisan Sourdough Boule you saved is now in the clearance zone at a deeper discount.",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "ca-5",
    type: "system",
    title: "Welcome to ERN Marketplace",
    message: "Shop rescue deals and prevent food waste while saving money. New deals added every hour!",
    time: "1 day ago",
    read: true,
  },
];

const TYPE_ICON: Record<CustomerAlert["type"], React.ElementType> = {
  deal: Tag,
  order: ShoppingBag,
  expiry: Clock,
  system: Bell,
};

const TYPE_STYLE: Record<CustomerAlert["type"], string> = {
  deal: "bg-primary/10 text-primary",
  order: "bg-blue-500/10 text-blue-500",
  expiry: "bg-amber-500/10 text-amber-500",
  system: "bg-secondary text-muted-foreground",
};

export default function CustomerAlerts() {
  const [alerts, setAlerts] = useState<CustomerAlert[]>(INITIAL_ALERTS);

  const markRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const dismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6 pb-24 text-foreground font-sans max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Deals, order updates and saved item alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-mono text-primary font-bold hover:underline cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-card border border-border text-center">
            <CheckCircle2 className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-bold text-foreground">You're all caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No notifications right now.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = TYPE_ICON[alert.type];
            return (
              <div
                key={alert.id}
                onClick={() => markRead(alert.id)}
                className={`p-4 rounded-2xl border border-border bg-card flex items-start gap-3.5 cursor-pointer transition-colors hover:bg-secondary/20 ${!alert.read ? "border-primary/30 bg-primary/5" : ""}`}
              >
                <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_STYLE[alert.type]}`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold text-foreground ${!alert.read ? "text-primary" : ""}`}>
                      {alert.title}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!alert.read && (
                        <span className="size-2 rounded-full bg-primary shrink-0" />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); dismiss(alert.id); }}
                        className="p-0.5 rounded hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1.5">{alert.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
