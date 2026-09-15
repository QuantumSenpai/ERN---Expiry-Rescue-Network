import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff as EyeClosed,
  ArrowLeft,
  Sun,
  Moon,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import {
  FaBarcode,
  FaBolt,
  FaCircleCheck,
  FaWandMagicSparkles,
  FaRotate,
  FaCircle,
} from "react-icons/fa6";
import BrandLogo from "@/components/BrandLogo";
import { useAuth, getRoleHomeRoute, normalizeRole } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface LoginProps {
  defaultPortal?: "user" | "staff" | "admin";
}

export default function Login({ defaultPortal }: LoginProps = {}) {
  const { login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const portalParam = searchParams.get("portal") || searchParams.get("role");
  const initialPortal: "user" | "staff" | "admin" =
    defaultPortal ||
    (portalParam === "admin"
      ? "admin"
      : portalParam === "staff" || portalParam === "retailer" || portalParam === "donor"
      ? "staff"
      : "user");

  const [activePortal, setActivePortal] = useState<"user" | "staff" | "admin">(initialPortal);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    if (portalParam === "admin") {
      setActivePortal("admin");
    } else if (portalParam === "staff" || portalParam === "retailer" || portalParam === "donor") {
      setActivePortal("staff");
    } else if (portalParam === "user" || portalParam === "customer" || portalParam === "buyer") {
      setActivePortal("user");
    }
  }, [portalParam]);

  useEffect(() => {
    const notice = sessionStorage.getItem("ern_auth_notice");
    if (notice) {
      setErrorMessage(notice);
      sessionStorage.removeItem("ern_auth_notice");
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const loggedUser = await login({ email: cleanEmail, password });
      const userNorm = normalizeRole(loggedUser.role);

      if (userNorm !== activePortal) {
        logout();
        setErrorMessage("Invalid email, password, or unauthorized for the selected portal.");
        return;
      }

      const targetRedirect = getRoleHomeRoute(userNorm);
      navigate(targetRedirect);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes("role") || msg.includes("unauthorized") || msg.includes("invalid email") || msg.includes("credentials")) {
          setErrorMessage("Invalid email, password, or unauthorized for the selected portal.");
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage("Invalid email, password, or unauthorized for the selected portal.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground relative overflow-hidden transition-colors duration-200 font-sans">
      
      <header className="relative z-30 flex items-center justify-between px-6 py-5 sm:px-12 max-w-[1600px] w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-medium text-foreground hover:bg-card transition-colors px-4 py-2 rounded-full border border-border bg-background shadow-none"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Home</span>
        </Link>

        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-full border border-border bg-background text-foreground hover:bg-secondary/40 transition-all cursor-pointer shadow-none"
          aria-label="Toggle theme"
          title="Switch theme"
        >
          {theme === "dark" ? (
            <Sun className="size-4 text-foreground" />
          ) : (
            <Moon className="size-4 text-foreground" />
          )}
        </button>
      </header>

      
      <main className="flex-1 flex items-center justify-center px-6 sm:px-12 py-4 sm:py-8 relative z-20 max-w-[1600px] w-full mx-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-center">
          
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-between space-y-8 pr-4 xl:pr-10">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <BrandLogo variant="auto" size="md" showText={true} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="space-y-4 max-w-xl"
              >
                <h1 className="font-display text-4xl xl:text-5xl font-[350] text-foreground tracking-[-0.025em] leading-[1.08]">
                  Everything that matters.<br />
                  <span className="font-script font-bold text-foreground text-5xl">Before it expires.</span>
                </h1>

                <p className="text-muted-foreground text-base font-body leading-relaxed max-w-lg">
                  Unified inventory monitoring, automated markdown intelligence, and zero-waste commercial liquidation across verified supply chains.
                </p>
              </motion.div>
            </div>

            
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="bg-card border border-border rounded-2xl sm:rounded-[32px] p-6 sm:p-7 space-y-5 shadow-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCircle className="size-2 text-foreground animate-pulse" />
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-foreground">
                    LIVE EXPIRY INTELLIGENCE ENGINE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-primary-foreground px-3 py-0.5 rounded-full bg-primary font-bold uppercase">
                  Connected
                </span>
              </div>

              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1.5 cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">STAGE 01</span>
                    <FaBarcode className="size-3.5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Batch Intake</h4>
                    <p className="text-[11px] font-sans text-muted-foreground leading-tight mt-0.5">Automated shelf-life logging</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1.5 cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">STAGE 02</span>
                    <FaBolt className="size-3.5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Rescue Staging</h4>
                    <p className="text-[11px] font-sans text-muted-foreground leading-tight mt-0.5">Dynamic markdown protocols</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1.5 cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">STAGE 03</span>
                    <FaCircleCheck className="size-3.5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Zero Waste</h4>
                    <p className="text-[11px] font-sans text-muted-foreground leading-tight mt-0.5">Full value recovery</p>
                  </div>
                </motion.div>
              </div>

              
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs">
                  <FaWandMagicSparkles className="size-3.5 text-foreground" />
                  <span className="font-bold text-foreground font-mono">100%</span>
                  <span className="text-muted-foreground font-body">Real-time Neon Postgres telemetry</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <FaRotate className="size-2.5 opacity-60" />
                  <span>Role-based routing</span>
                </div>
              </div>
            </motion.div>

            
            <div className="text-xs text-muted-foreground font-mono flex items-center gap-4">
              <span>&copy; {new Date().getFullYear()} ERN Network</span>
              <span>&bull;</span>
              <span>256-bit TLS encrypted</span>
              <span>&bull;</span>
              <span>JWT HS256 Authenticated</span>
            </div>
          </div>

          
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="w-full max-w-[440px] bg-card border border-border rounded-2xl sm:rounded-[32px] p-7 sm:p-8 space-y-6 shadow-none"
            >
              
              {/* 3-Way Portal Switcher */}
              <div className="flex items-center p-1 rounded-full bg-secondary/80 border border-border text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal("user");
                    setErrorMessage(null);
                  }}
                  className={cn(
                    "flex-1 py-1.5 px-2.5 rounded-full font-bold transition-all cursor-pointer text-center",
                    activePortal === "user"
                      ? "bg-card text-foreground shadow-xs border border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal("staff");
                    setErrorMessage(null);
                  }}
                  className={cn(
                    "flex-1 py-1.5 px-2.5 rounded-full font-bold transition-all cursor-pointer text-center",
                    activePortal === "staff"
                      ? "bg-card text-foreground shadow-xs border border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Staff
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal("admin");
                    setErrorMessage(null);
                  }}
                  className={cn(
                    "flex-1 py-1.5 px-2.5 rounded-full font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1",
                    activePortal === "admin"
                      ? "bg-card text-foreground shadow-xs border border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ShieldCheck className="size-3.5 text-accent" />
                  <span>Admin</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase">
                  {activePortal === "admin" ? (
                    <>
                      <ShieldCheck className="size-3 text-accent" />
                      <span>Enterprise Admin Portal</span>
                    </>
                  ) : activePortal === "staff" ? (
                    <span>Facility Staff Portal</span>
                  ) : (
                    <span>Community User Portal</span>
                  )}
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-[400] text-foreground tracking-[-0.02em] leading-tight pt-1">
                  {activePortal === "admin"
                    ? "Admin Sign In"
                    : activePortal === "staff"
                    ? "Staff Sign In"
                    : "User Sign In"}
                </h2>

                <p className="text-xs text-muted-foreground font-body">
                  {activePortal === "admin"
                    ? "Access system telemetry, multi-facility compliance, and global governance controls."
                    : activePortal === "staff"
                    ? "Access facility inventory intelligence, batch intake, and dynamic markdown controls."
                    : "Access food rescue marketplace, lot reservations, and distribution orders."}
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono flex items-start gap-2.5 animate-in fade-in">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <div className="leading-snug font-sans">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-muted-foreground font-bold">
                    Email address
                  </label>
                  <div className="relative flex items-center">
                    <Mail
                      className={cn(
                        "absolute left-3.5 size-4 transition-colors duration-150",
                        focusedInput === "email" ? "text-foreground" : "text-muted-foreground"
                      )}
                    />
                    <input
                      type="email"
                      placeholder={
                        activePortal === "admin"
                          ? "admin@ern-network.com"
                          : activePortal === "staff"
                          ? "metro.supermarket@ern-network.com"
                          : "priya.sharma@example.com"
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-3 py-2.5 bg-background border border-border focus:border-primary focus:bg-card rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 font-sans shadow-none"
                    />
                  </div>
                </div>

                
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-muted-foreground font-bold">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock
                      className={cn(
                        "absolute left-3.5 size-4 transition-colors duration-150",
                        focusedInput === "password" ? "text-foreground" : "text-muted-foreground"
                      )}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-background border border-border focus:border-primary focus:bg-card rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 font-sans shadow-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <Eye className="size-4" /> : <EyeClosed className="size-4" />}
                    </button>
                  </div>
                </div>

                
                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-border bg-background text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <span className="font-body text-muted-foreground hover:text-foreground transition-colors">
                      Remember this workstation
                    </span>
                  </label>

                  <a
                    href="mailto:support@ern-network.com?subject=ERN%20Account%20Support%20Request"
                    className="text-xs font-mono text-muted-foreground hover:text-foreground hover:underline transition-colors"
                  >
                    Need help? Contact support
                  </a>
                </div>

                
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-full bg-primary hover:opacity-95 text-primary-foreground font-bold text-xs sm:text-sm uppercase tracking-wider font-mono transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 shadow-none disabled:opacity-60 min-h-[44px]"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        <span className="font-mono">AUTHENTICATING...</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="btn-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        SIGN IN →
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>

              
              {activePortal === "admin" ? (
                <div className="text-center text-xs text-muted-foreground font-mono pt-3 border-t border-border space-y-1.5">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-foreground flex items-center justify-center gap-1">
                    <ShieldCheck className="size-3.5 text-accent" />
                    <span>Authorized Administrative Accounts</span>
                  </p>
                  <p className="text-[10.5px]">
                    <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground">admin@ern-network.com</code> • <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground">dev-admin@ern-network.com</code>
                  </p>
                  <p className="text-[11px] pt-1">
                    Need new admin clearance?{" "}
                    <Link to="/signup?role=admin" className="text-foreground hover:underline font-bold">
                      Admin Registration
                    </Link>
                  </p>
                </div>
              ) : activePortal === "staff" ? (
                <div className="text-center text-xs text-muted-foreground font-body pt-2 border-t border-border">
                  Need a store or facility staff account?{" "}
                  <Link to="/signup?role=staff" className="text-foreground hover:underline font-bold">
                    Register Staff Account
                  </Link>
                </div>
              ) : (
                <div className="text-center text-xs text-muted-foreground font-body pt-2 border-t border-border">
                  Need a community or buyer account?{" "}
                  <Link to="/signup?role=user" className="text-foreground hover:underline font-bold">
                    Register User Account
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}