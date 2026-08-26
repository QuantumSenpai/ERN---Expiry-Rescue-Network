import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  History,
  PlusCircle,
  Upload,
  RefreshCw,
  Truck,
  Sliders,
  CheckCircle2,
} from "lucide-react";

interface RecentActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACTIVITIES = [
  {
    id: "act-1",
    user: "Md Danish Raza",
    action: "added 24 products to Store A",
    time: "Today · 11:42 AM",
    icon: PlusCircle,
    color: "text-primary bg-primary/10",
  },
  {
    id: "act-2",
    user: "System / Ingestion",
    action: "12 products imported from CSV batch",
    time: "Today · 10:18 AM",
    icon: Upload,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    id: "act-3",
    user: "Krishnendu Adak",
    action: "updated expiry date for Batch MILK-402",
    time: "Today · 09:52 AM",
    icon: RefreshCw,
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    id: "act-4",
    user: "Operations Logistics",
    action: "20 units transferred from Warehouse to Store B",
    time: "Yesterday · 6:24 PM",
    icon: Truck,
    color: "text-blue-400 bg-blue-500/10",
  },
  {
    id: "act-5",
    user: "Md Danish Raza",
    action: "adjusted reorder threshold for Paracetamol 500mg",
    time: "Yesterday · 4:12 PM",
    icon: Sliders,
    color: "text-purple-400 bg-purple-500/10",
  },
  {
    id: "act-6",
    user: "System Audit",
    action: "verified 94% inventory data completeness index",
    time: "2 days ago · 11:00 AM",
    icon: CheckCircle2,
    color: "text-emerald-500 bg-emerald-500/10",
  },
];

export default function RecentActivityDrawer({
  isOpen,
  onClose,
}: RecentActivityDrawerProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg1C3A-[#2F4156]/60 backdrop-blur-xs"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/80 flex items-start justify-between gap-4 bg-secondary/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[11px] font-mono font-bold flex items-center gap-1">
                    <History className="size-3" /> AUDIT LOG
                  </span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mt-1">
                  Recent Activity
                </h2>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Chronological workspace record of inventory changes, updates, and transfers.
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 divide-y divide-border/60">
              {ACTIVITIES.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-3.5">
                    <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                      <Icon className="size-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground font-sans">
                        {act.user} <span className="font-normal text-muted-foreground">{act.action}</span>
                      </p>
                      <p className="text-[10.5px] font-mono text-muted-foreground mt-1">{act.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
