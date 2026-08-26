import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff as EyeClosed,
  ShieldCheck,
  UserCheck,
  Users,
  ArrowLeft,
  Sun,
  Moon,
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
import { useAuth, type Role, getRoleHomeRoute } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

type AccessRole = "admin" | "staff" | "user";

const ROLE_PRESETS: Record<
  AccessRole,
  { email: string; name: string; authRole: Role; redirect: string }
> = {
  admin: {
    email: "admin@enterprise.io",
    name: "Enterprise Admin",
    authRole: "admin",
    redirect: "/admin/dashboard",
  },
  staff: {
    email: "operations@enterprise.io",
    name: "Operations Staff",
    authRole: "retailer",
    redirect: "/retailer/dashboard",
  },
  user: {
    email: "user@enterprise.io",
    name: "Customer Rescuer",
    authRole: "customer",
    redirect: "/marketplace",
  },
};

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<AccessRole>("admin");
  const [email, setEmail] = useState("admin@enterprise.io");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleRoleSelect = (role: AccessRole) => {
    setSelectedRole(role);
    setEmail(ROLE_PRESETS[role].email);
    setPassword("••••••••••••");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    const preset = ROLE_PRESETS[selectedRole];
    const authRole: Role = preset.authRole;
    const targetRedirect = getRoleHomeRoute(authRole);

    setTimeout(() => {
      login({
        id: Date.now(),
        name: preset.name,
        email: email.trim(),
        role: authRole,
      });
      setIsLoading(false);
      navigate(targetRedirect);
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
                  Everything that matters.<br />
                  Before it expires.
                </h1>

                <p className="text-muted-foreground text-base font-body leading-relaxed max-w-lg">
                  Unified inventory monitoring, automated markdown intelligence, and zero-waste commercial liquidation across enterprise supply chains.
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
                    LIVE EXPIRY INTELLIGENCE ENGINE
                  </span>
                </div>
                <span className="text-[10px] font-mono text-foreground px-3 py-0.5 rounded-full bg-accent font-bold uppercase">
                  v2.4 Active
                </span>
              </div>

              {/* 3 Stage Items */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                {/* Stage 01 */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="p-4 rounded-xl bg-secondary border border-border space-y-1.5 cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">
                      STAGE 01
                    </span>
                    <FaBarcode className="size-3.5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Batch Intake
                    </h4>
                    <p className="text-[11px] font-sans text-muted-foreground leading-tight mt-0.5">
                      Automated shelf-life logging
                    </p>
                  </div>
                </motion.div>

                {/* Stage 02 */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="p-4 rounded-xl bg-secondary border border-border space-y-1.5 cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">
                      STAGE 02
                    </span>
                    <FaBolt className="size-3.5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Rescue Staging
                    </h4>
                    <p className="text-[11px] font-sans text-muted-foreground leading-tight mt-0.5">
                      Dynamic markdown protocols
                    </p>
                  </div>
                </motion.div>

                {/* Stage 03 */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className="p-4 rounded-xl bg-secondary border border-border space-y-1.5 cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">
                      STAGE 03
                    </span>
                    <FaCircleCheck className="size-3.5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Zero Waste
                    </h4>
                    <p className="text-[11px] font-sans text-muted-foreground leading-tight mt-0.5">
                      Full inventory value recovery
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Flat Metric Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs">
                  <FaWandMagicSparkles className="size-3.5 text-foreground" />
                  <span className="font-bold text-foreground font-mono">99.4%</span>
                  <span className="text-muted-foreground font-body">Freshness verification accuracy</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <FaRotate className="size-2.5 opacity-60" />
                  <span>0% manual reconciliation</span>
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

          {/* RIGHT COLUMN: Authentication Panel */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="w-full max-w-[440px] bg-card border border-border rounded-2xl sm:rounded-[32px] p-7 sm:p-8 space-y-6 shadow-none ern-card-glow"
            >
              {/* Panel Header */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase">
                  <span>Welcome back</span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-[400] text-foreground tracking-[-0.02em] leading-tight pt-1">
                  Sign in to ERN
                </h2>

                <p className="text-xs text-muted-foreground font-body">
                  Access your inventory intelligence and rescue portal.
                </p>
              </div>

              {/* Role Selection Switch */}
              <div className="p-1 rounded-full bg-secondary">
                <div className="grid grid-cols-3 gap-1 text-xs font-mono">
                  {/* Admin */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="button"
                    onClick={() => handleRoleSelect("admin")}
                    className={cn(
                      "py-2 px-2.5 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 font-bold",
                      selectedRole === "admin"
                        ? "bg-primary text-primary-foreground shadow-none"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ShieldCheck className="size-3.5" />
                    <span>Admin</span>
                  </motion.button>

                  {/* Staff */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="button"
                    onClick={() => handleRoleSelect("staff")}
                    className={cn(
                      "py-2 px-2.5 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 font-bold",
                      selectedRole === "staff"
                        ? "bg-primary text-primary-foreground shadow-none"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <UserCheck className="size-3.5" />
                    <span>Staff</span>
                  </motion.button>

                  {/* User */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="button"
                    onClick={() => handleRoleSelect("user")}
                    className={cn(
                      "py-2 px-2.5 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 font-bold",
                      selectedRole === "user"
                        ? "bg-primary text-primary-foreground shadow-none"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Users className="size-3.5" />
                    <span>User</span>
                  </motion.button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Address */}
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
                      placeholder="name@organization.com"
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
                      placeholder="Enter your password"
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
                </div>

                {/* Remember Me / Forgot Password */}
                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-border bg-background text-foreground focus:ring-primary cursor-pointer accent-primary"
                    />
                    <span className="font-body text-muted-foreground hover:text-foreground transition-colors">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => alert("Password reset instructions sent to your email!")}
                    className="font-body text-foreground hover:underline font-bold transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Primary CTA: Sign In */}
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

              {/* Footer Switch */}
              <div className="text-center text-xs text-muted-foreground font-body pt-2 border-t border-border">
                Don't have an account?{" "}
                <Link to="/signup" className="text-foreground hover:underline font-bold">
                  Create account
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}