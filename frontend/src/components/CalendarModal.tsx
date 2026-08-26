import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CalendarEvent {
  date: number;
  month: number; // 0-indexed
  year: number;
  title: string;
  type: "critical" | "warning" | "safe" | "restock";
  count: string;
  detail: string;
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    date: 17,
    month: 7, // August
    year: 2026,
    title: "Amul Taaza Milk 1L (Batch MLK-042)",
    type: "critical",
    count: "45 Units",
    detail: "Critical 2-day expiry. 60% Flash Clearance active.",
  },
  {
    date: 15,
    month: 7,
    year: 2026,
    title: "Today: System Expiry & Inventory Audit",
    type: "safe",
    count: "128 SKUs",
    detail: "Scheduled automated store inventory reconciliation.",
  },
  {
    date: 18,
    month: 7,
    year: 2026,
    title: "Britannia Wheat Bread (Batch BRD-101)",
    type: "critical",
    count: "60 Units",
    detail: "Expires in 3 days. Dynamic markdown push required.",
  },
  {
    date: 21,
    month: 7,
    year: 2026,
    title: "Tropicana Orange Juice (Batch OJ789)",
    type: "warning",
    count: "30 Units",
    detail: "15% Promotional tier initiated.",
  },
  {
    date: 23,
    month: 7,
    year: 2026,
    title: "Amul Masti Dahi 400g (Batch C321)",
    type: "warning",
    count: "25 Units",
    detail: "Dairy cooler bay markdown scheduled.",
  },
  {
    date: 25,
    month: 7,
    year: 2026,
    title: "Cipla Paracetamol 500mg (Batch MED-902)",
    type: "warning",
    count: "85 Strips",
    detail: "Return guarantee window reminder to distributor.",
  },
  {
    date: 28,
    month: 7,
    year: 2026,
    title: "New Supplier Dispatch: Amul Fed",
    type: "restock",
    count: "150 Crates",
    detail: "Scheduled fresh milk & curd warehouse arrival.",
  },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLocalDateInfo() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(), // 0-indexed
    day: now.getDate(),
    timeZone: tz,
  };
}

export default function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  // Dynamically initialize with user's local browser date/time
  const [today, setToday] = useState(getLocalDateInfo);
  const [currentYear, setCurrentYear] = useState(() => getLocalDateInfo().year);
  const [currentMonth, setCurrentMonth] = useState(() => getLocalDateInfo().month);
  const [selectedDay, setSelectedDay] = useState(() => getLocalDateInfo().day);
  const [activeFilter, setActiveFilter] = useState<"all" | "critical" | "warning" | "restock">("all");

  // Reset calendar to current local date every time modal opens
  useEffect(() => {
    if (isOpen) {
      const fresh = getLocalDateInfo();
      setToday(fresh);
      setCurrentYear(fresh.year);
      setCurrentMonth(fresh.month);
      setSelectedDay(fresh.day);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calendar calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    const current = getLocalDateInfo();
    setToday(current);
    setCurrentYear(current.year);
    setCurrentMonth(current.month);
    setSelectedDay(current.day);
  };

  // Events on selected day
  const selectedDayEvents = SAMPLE_EVENTS.filter(
    (e) =>
      e.year === currentYear &&
      e.month === currentMonth &&
      e.date === selectedDay &&
      (activeFilter === "all" || e.type === activeFilter)
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md transition-opacity"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-card border border-primary/30 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-foreground"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <CalendarIcon className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <span>Enterprise Expiry & Stock Calendar</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Batch expiration milestones, clearance countdowns & supplier restock schedule
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Month Navigation & Shortcuts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-foreground">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleJumpToday}
              className="px-3 py-1.5 rounded-xl bg-secondary/80 border border-border text-xs font-mono font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              Jump to Today ({today.day} {MONTH_NAMES[today.month].slice(0, 3)} {today.year})
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          {[
            { label: "All Milestones", val: "all" },
            { label: "🔴 Critical (<7d)", val: "critical" },
            { label: "🟡 Warning (15-30d)", val: "warning" },
            { label: "🚚 Restock Arrivals", val: "restock" },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setActiveFilter(f.val as any)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeFilter === f.val
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="p-4 rounded-2xl bg-secondary/20 border border-border space-y-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-muted-foreground uppercase pb-1 border-b border-border/60">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
            {/* Previous Month Days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div
                key={`prev-${i}`}
                className="py-2.5 text-muted-foreground/30 rounded-xl"
              >
                {daysInPrevMonth - firstDayOfMonth + i + 1}
              </div>
            ))}

            {/* Current Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = day === selectedDay;
              const isToday =
                day === today.day &&
                currentMonth === today.month &&
                currentYear === today.year;

              // Check if day has events
              const dayEvents = SAMPLE_EVENTS.filter(
                (e) =>
                  e.year === currentYear &&
                  e.month === currentMonth &&
                  e.date === day
              );

              const hasCritical = dayEvents.some((e) => e.type === "critical");
              const hasWarning = dayEvents.some((e) => e.type === "warning");
              const hasRestock = dayEvents.some((e) => e.type === "restock");

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`relative py-2.5 rounded-xl transition-all font-semibold cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md font-bold scale-105"
                      : isToday
                      ? "bg-primary/15 text-primary border border-primary/40 font-bold"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  <span>{day}</span>

                  {/* Event indicator dots */}
                  {dayEvents.length > 0 && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {hasCritical && (
                        <span className="size-1.5 rounded-full bg-destructive animate-ping" />
                      )}
                      {hasWarning && (
                        <span className="size-1.5 rounded-full bg-amber-500" />
                      )}
                      {hasRestock && (
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Agenda / Expiry Events */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase text-foreground tracking-wider flex items-center gap-2">
              <Clock className="size-3.5 text-primary" />
              <span>
                Schedule for {selectedDay} {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {selectedDayEvents.length} lot milestone(s)
            </span>
          </div>

          {selectedDayEvents.length > 0 ? (
            <div className="space-y-2">
              {selectedDayEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                    evt.type === "critical"
                      ? "bg-destructive/10 border-destructive/30 text-destructive"
                      : evt.type === "warning"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                      : evt.type === "restock"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                      : "bg-secondary/40 border-border text-foreground"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{evt.title}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-card/60">
                        {evt.count}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-sans">{evt.detail}</p>
                  </div>

                  {evt.type === "critical" && (
                    <Link
                      to="/retailer/clearance"
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors shrink-0 shadow-xs flex items-center gap-1"
                    >
                      <span>Clearance</span>
                      <ArrowUpRight className="size-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-muted-foreground font-mono">
              No critical batch expiries or supplier deliveries scheduled on this date.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-between items-center text-xs">
          <Link
            to="/retailer/batches"
            onClick={onClose}
            className="text-primary hover:underline font-semibold font-mono flex items-center gap-1"
          >
            <span>View All Batches Tracker</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
          >
            Close Calendar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
