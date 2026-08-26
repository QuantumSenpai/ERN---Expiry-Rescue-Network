import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Building2,
  Eye,
  EyeOff as EyeClosed,
  Check,
  ArrowLeft,
  Sun,
  Moon,
} from "lucide-react";
import {
  FaLayerGroup,
  FaChartLine,
  FaShieldHalved,
  FaWandMagicSparkles,
  FaRotate,
  FaCircle,
} from "react-icons/fa6";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

// Password strength calculator helper
function getPasswordStrength(pass: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!pass) return { score: 0, label: "", color: "bg-secondary/50" };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score === 1) return { score: 1, label: "Weak", color: "bg-[#666666]" };
  if (score === 2) return { score: 2, label: "Medium", color: "bg-destructive" };
  return { score: 3, label: "Strong", color: "bg-[#2F4156]" };
}

export default function Signup() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [touched, setTouched] = useState<{
    orgName?: boolean;
    email?: boolean;
    password?: boolean;
    agreed?: boolean;
  }>({});

  const passwordStrength = getPasswordStrength(password);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isOrgValid = orgName.trim().length > 0;
  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = password.length >= 8;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ orgName: true, email: true, password: true, agreed: true });

    if (!isOrgValid) {
      setError("Organization name is required.");
      return;
    }
    if (!isEmailValid) {
      setError("Enter a valid email address.");
      return;
    }
    if (!isPasswordValid) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setError("");
    setIsLoading(true);

    setTimeout(() => {
      login({
        id: Date.now(),
        name: orgName.trim(),
        email: email.trim(),
        role: "retailer",
      });
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/retailer/dashboard");
      }, 700);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-[#2F4156] selection:text-foreground relative overflow-hidden transition-colors duration-200">
      {/* Top Header */}
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
          title={`Switch theme`}
        >
          {theme === "dark" ? (
            <Sun className="size-4 text-foreground" />
          ) : (
            <Moon className="size-4 text-foreground" />
          )}
        </button>
      </header>

      {/* Main Two-Column Composition */}
      <main className="flex-1 flex items-center justify-center px-6 sm:px-12 py-4 sm:py-8 relative z-20 max-w-[1600px] w-full mx-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-center">
          {/* LEFT COLUMN */}
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
                  Deploy enterprise<br />
                  expiry intelligence.
                </h1>

                <p className="text-muted-foreground text-base font-body leading-relaxed max-w-lg">
                  Integrate your catalog, activate automated FEFO priority alerts, and liquidate near-expiry stock before margin erosion.
                </p>
              </motion.div>
            </div>

            {/* Engine Feature Card */}
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
                    ORGANIZATIONAL ONBOARDING
                  </span>
                </div>
                <span className="text-[10px] font-mono text-foreground px-3 py-0.5 rounded-full bg-accent font-bold uppercase">
                  Free 14-Day Pilot
                </span>
              </div>

              {/* 3 Step Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="p-4 rounded-xl bg-secondary border border-border space-y-1.5 cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">STEP 1</span>
                    <FaLayerGroup className="size-3.5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Connect Warehouses</h4>
                    <p className="text-[11px] font-sans text-muted-foreground leading-tight mt-0.5">
                      Multi-location inventory sync
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="p-4 rounded-xl bg-secondary border border-border space-y-1.5 cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">STEP 2</span>
                    <FaChartLine className="size-3.5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Set FEFO Triggers</h4>
                    <p className="text-[11px] font-sans text-muted-foreground leading-tight mt-0.5">
                      Custom shelf-life thresholds
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="p-4 rounded-xl bg-secondary border border-border space-y-1.5 cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">STEP 3</span>
                    <FaShieldHalved className="size-3.5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Rescue Liquidation</h4>
                    <p className="text-[11px] font-sans text-muted-foreground leading-tight mt-0.5">
                      Direct marketplace clearance
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Metric note */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs">
                  <FaWandMagicSparkles className="size-3.5 text-foreground" />
                  <span className="font-bold text-foreground font-mono">100% SLA</span>
                  <span className="text-muted-foreground font-body">Zero setup fee onboarding</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <FaRotate className="size-2.5 opacity-60" />
                  <span>Instant sandbox deployment</span>
                </div>
              </div>
            </motion.div>

            {/* Bottom Footer Note */}
            <div className="text-xs text-muted-foreground font-mono flex items-center gap-4">
              <span>&copy; {new Date().getFullYear()} ERN Network</span>
              <span>&bull;</span>
              <span>256-bit TLS encrypted</span>
              <span>&bull;</span>
              <span>ISO 27001 Certified</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Sign Up Panel */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="w-full max-w-[440px] bg-card border border-border rounded-2xl sm:rounded-[32px] p-7 sm:p-8 space-y-6 shadow-none ern-card-glow"
            >
              {/* Header */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase">
                  <span>Get Started</span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-[400] text-foreground tracking-[-0.02em] leading-tight pt-1">
                  Create an account
                </h2>

                <p className="text-xs text-muted-foreground font-body">
                  Start tracking shelf-life and preventing waste today.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/20 border border-[#9F995B]/40 text-xs font-mono text-foreground">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Org Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-muted-foreground font-bold">
                    Organization name
                  </label>
                  <div className="relative flex items-center">
                    <Building2
                      className={cn(
                        "absolute left-3.5 size-4 transition-colors duration-150",
                        focusedInput === "orgName" ? "text-foreground" : "text-muted-foreground"
                      )}
                    />
                    <input
                      type="text"
                      placeholder="e.g. Metro Retail Corp"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      onFocus={() => setFocusedInput("orgName")}
                      onBlur={() => setFocusedInput(null)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-background border border-border focus:border-primary focus:bg-card rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 font-sans shadow-none"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-muted-foreground font-bold">
                    Work email address
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
                      placeholder="admin@organization.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-background border border-border focus:border-primary focus:bg-card rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 font-sans shadow-none"
                    />
                  </div>
                </div>

                {/* Password */}
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
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-background border border-border focus:border-primary focus:bg-card rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 font-sans shadow-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 cursor-pointer text-foreground hover:text-primary transition-colors p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeClosed className="size-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Terms Agreement */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-border bg-background text-foreground focus:ring-primary cursor-pointer accent-primary"
                    />
                    <span className="font-body text-muted-foreground">
                      I agree to the{" "}
                      <span className="text-foreground underline font-bold">Terms of Service</span> and{" "}
                      <span className="text-foreground underline font-bold">Privacy Policy</span>.
                    </span>
                  </label>
                </div>

                {/* Primary CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-full bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs sm:text-sm uppercase tracking-wider font-mono transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 shadow-none disabled:opacity-60"
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
                        <span className="font-mono">PROVISIONING...</span>
                      </motion.div>
                    ) : isSuccess ? (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5"
                      >
                        <Check className="size-4" />
                        <span>ACCOUNT CREATED</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="btn-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        CREATE WORKSPACE →
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>

              {/* Footer Switch */}
              <div className="text-center text-xs text-muted-foreground font-body pt-2 border-t border-border">
                Already have an account?{" "}
                <Link to="/login" className="text-foreground hover:underline font-bold">
                  Sign in
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}