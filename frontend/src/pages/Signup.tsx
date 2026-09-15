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
  Store,
  Users,
  AlertTriangle,
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

import { useSearchParams } from "react-router-dom";
import { KeyRound, ShieldCheck as ShieldCheckIcon } from "lucide-react";

function getPasswordStrength(pass: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!pass) return { score: 0, label: "", color: "bg-secondary" };
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (/[A-Za-z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
  if (pass.length >= 10 || /[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score === 1) return { score: 1, label: "Basic", color: "bg-destructive/60" };
  if (score === 2) return { score: 2, label: "Medium", color: "bg-secondary" };
  return { score: 3, label: "Strong", color: "bg-primary" };
}

export default function Signup() {
  const { signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleParam = searchParams.get("role");
  const initialRole: "admin" | "staff" | "user" =
    roleParam === "admin"
      ? "admin"
      : roleParam === "staff" || roleParam === "retailer" || roleParam === "donor"
      ? "staff"
      : "user";

  const [role, setRole] = useState<"admin" | "staff" | "user">(initialRole);
  const [buyerType, setBuyerType] = useState<"individual" | "ngo" | "orphanage">("individual");
  const [adminInviteKey, setAdminInviteKey] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const hasMinLength = password.length >= 6;
  const hasLetters = /[A-Za-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLetters && hasNumbers;
  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError(
        role === "admin"
          ? "Please enter your administrator name."
          : role === "staff"
          ? "Please enter your store or facility name."
          : "Please enter your full name or organization."
      );
      return;
    }
    if (!cleanEmail) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isPasswordValid) {
      setError("Password must be at least 6 characters long and contain both letters and numbers.");
      return;
    }
    if (role === "admin" && !adminInviteKey.trim()) {
      setError("Admin Invite Key is required for administrator registration.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        name: cleanName,
        email: cleanEmail,
        password,
        role,
        buyer_type: role === "user" ? buyerType : undefined,
        admin_invite_key: role === "admin" ? adminInviteKey.trim() : undefined,
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration could not be completed. Please try again.");
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
                  Deploy enterprise<br />
                  <span className="font-script font-bold text-foreground text-5xl">rescue intelligence.</span>
                </h1>

                <p className="text-muted-foreground text-base font-body leading-relaxed max-w-lg">
                  Integrate your store catalog, configure dynamic markdown triggers, and liquidate near-expiry stock before margin erosion.
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
                    ORGANIZATIONAL ONBOARDING
                  </span>
                </div>
                <span className="text-[10px] font-mono text-primary-foreground px-3 py-0.5 rounded-full bg-primary font-bold uppercase">
                  Network Access
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
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">STEP 1</span>
                    <FaLayerGroup className="size-3.5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Register Entity</h4>
                    <p className="text-[11px] font-sans text-muted-foreground leading-tight mt-0.5">Store or buyer profile</p>
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
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">STEP 2</span>
                    <FaChartLine className="size-3.5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Verification</h4>
                    <p className="text-[11px] font-sans text-muted-foreground leading-tight mt-0.5">Admin approval review</p>
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
                    <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">STEP 3</span>
                    <FaShieldHalved className="size-3.5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Live Clearing</h4>
                    <p className="text-[11px] font-sans text-muted-foreground leading-tight mt-0.5">Instant rescue trading</p>
                  </div>
                </motion.div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs">
                  <FaWandMagicSparkles className="size-3.5 text-foreground" />
                  <span className="font-bold text-foreground font-mono">100% SLA</span>
                  <span className="text-muted-foreground font-body">Compliant food rescue protocols</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <FaRotate className="size-2.5 opacity-60" />
                  <span>Instant portal access</span>
                </div>
              </div>
            </motion.div>

            <div className="text-xs text-muted-foreground font-mono flex items-center gap-4">
              <span>&copy; {new Date().getFullYear()} ERN Network</span>
              <span>&bull;</span>
              <span>256-bit TLS encrypted</span>
              <span>&bull;</span>
              <span>Postgres-backed Authentication</span>
            </div>
          </div>

          
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="w-full max-w-[440px] bg-card border border-border rounded-2xl sm:rounded-[32px] p-7 sm:p-8 space-y-6 shadow-none"
            >
              {isSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="size-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto">
                    <Check className="size-7" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    Account Created Successfully
                  </h3>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-sm mx-auto">
                    Your {role.toUpperCase()} account has been provisioned and registered in ERN. You may now sign in to your designated workspace.
                  </p>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/login?portal=${role}`)}
                      className="w-full py-3 px-4 rounded-full bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Proceed to Sign In ({role.toUpperCase()}) →
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase">
                      {role === "admin" ? (
                        <>
                          <ShieldCheckIcon className="size-3 text-accent" />
                          <span>Enterprise Admin Registration</span>
                        </>
                      ) : role === "staff" ? (
                        <span>Facility Staff Registration</span>
                      ) : (
                        <span>Community User Registration</span>
                      )}
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl font-[400] text-foreground tracking-[-0.02em] leading-tight pt-1">
                      {role === "admin"
                        ? "Register Admin"
                        : role === "staff"
                        ? "Register Staff"
                        : "Create User Account"}
                    </h2>

                    <p className="text-xs text-muted-foreground font-body">
                      {role === "admin"
                        ? "Provision an enterprise administrator workstation with global authority."
                        : role === "staff"
                        ? "Register your facility, supermarket, or warehouse store node."
                        : "Join ERN to reserve near-expiry food lots, rescue inventory, and track orders."}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono flex items-start gap-2.5 animate-in fade-in">
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <div className="leading-snug font-sans">{error}</div>
                    </div>
                  )}

                  {/* 3-Way Registration Role Toggle */}
                  <div className="p-1 rounded-full bg-secondary grid grid-cols-3 gap-1 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setRole("user")}
                      className={cn(
                        "py-2 px-2.5 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 font-bold",
                        role === "user"
                          ? "bg-primary text-primary-foreground shadow-none"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Users className="size-3.5" />
                      <span>User</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("staff")}
                      className={cn(
                        "py-2 px-2.5 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 font-bold",
                        role === "staff"
                          ? "bg-primary text-primary-foreground shadow-none"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Store className="size-3.5" />
                      <span>Staff</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={cn(
                        "py-2 px-2.5 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 font-bold",
                        role === "admin"
                          ? "bg-primary text-primary-foreground shadow-none"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <ShieldCheckIcon className="size-3.5" />
                      <span>Admin</span>
                    </button>
                  </div>

                  {/* Buyer Type Selector (for User role) */}
                  {role === "user" && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label className="block text-xs font-mono uppercase text-muted-foreground font-bold">
                        User / Buyer Type
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-secondary rounded-full font-mono text-[11px]">
                        <button
                          type="button"
                          onClick={() => setBuyerType("individual")}
                          className={cn(
                            "py-1.5 px-2 rounded-full cursor-pointer transition-all",
                            buyerType === "individual"
                              ? "bg-primary text-primary-foreground font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Individual
                        </button>
                        <button
                          type="button"
                          onClick={() => setBuyerType("ngo")}
                          className={cn(
                            "py-1.5 px-2 rounded-full cursor-pointer transition-all",
                            buyerType === "ngo"
                              ? "bg-primary text-primary-foreground font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          NGO / Bank
                        </button>
                        <button
                          type="button"
                          onClick={() => setBuyerType("orphanage")}
                          className={cn(
                            "py-1.5 px-2 rounded-full cursor-pointer transition-all",
                            buyerType === "orphanage"
                              ? "bg-primary text-primary-foreground font-bold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Shelter
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Admin Invite Key Input (for Admin role) */}
                  {role === "admin" && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-mono uppercase text-accent font-bold flex items-center gap-1.5">
                          <KeyRound className="size-3.5" />
                          <span>Admin Invite Key (Required)</span>
                        </label>
                      </div>
                      <div className="relative flex items-center">
                        <KeyRound
                          className={cn(
                            "absolute left-3.5 size-4 transition-colors duration-150",
                            focusedInput === "adminKey" ? "text-foreground" : "text-muted-foreground"
                          )}
                        />
                        <input
                          id="admin_invite_key"
                          name="admin_invite_key"
                          type="password"
                          placeholder="ern_adm_..."
                          value={adminInviteKey}
                          onChange={(e) => setAdminInviteKey(e.target.value)}
                          onFocus={() => setFocusedInput("adminKey")}
                          onBlur={() => setFocusedInput(null)}
                          required
                          className="w-full pl-10 pr-3 py-2.5 bg-background border border-accent/40 focus:border-accent focus:bg-card rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 font-mono shadow-none"
                        />
                      </div>
                      <p className="text-[11px] font-mono text-muted-foreground">
                        Requires authorized Enterprise Admin Invite Key to provision an administrative node.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-muted-foreground font-bold">
                        {role === "admin"
                          ? "Administrator Name"
                          : role === "staff"
                          ? "Facility or Store Name"
                          : "Full Name or Organization"}
                      </label>
                      <div className="relative flex items-center">
                        <Building2
                          className={cn(
                            "absolute left-3.5 size-4 transition-colors duration-150",
                            focusedInput === "name" ? "text-foreground" : "text-muted-foreground"
                          )}
                        />
                        <input
                          type="text"
                          placeholder={
                            role === "admin"
                              ? "e.g. Lead Infrastructure Admin"
                              : role === "staff"
                              ? "e.g. Metro Supermarket • Indiranagar"
                              : "e.g. Priya Sharma"
                          }
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onFocus={() => setFocusedInput("name")}
                          onBlur={() => setFocusedInput(null)}
                          required
                          className="w-full pl-10 pr-3 py-2.5 bg-background border border-border focus:border-primary focus:bg-card rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 font-sans shadow-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-muted-foreground font-bold">
                        {role === "admin" ? "Administrative Work Email" : "Email address"}
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
                            role === "admin"
                              ? "admin.ops@ern-network.com"
                              : role === "staff"
                              ? "store.mgr@organization.com"
                              : "user@example.com"
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
                        Password (min 6 characters, mixed alphanumeric)
                      </label>
                      <div className="relative flex items-center">
                        <Lock
                          className={cn(
                            "absolute left-3.5 size-4 transition-colors duration-150",
                            focusedInput === "password" ? "text-foreground" : "text-muted-foreground"
                          )}
                        />
                        <input
                          id="signup_password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 6 alphanumeric characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedInput("password")}
                          onBlur={() => setFocusedInput(null)}
                          required
                          autoComplete="new-password"
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

                      {/* Password Alphanumeric Validation Indicators */}
                      <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1",
                            hasMinLength
                              ? "bg-primary/10 border-primary text-primary font-bold"
                              : "bg-secondary border-border text-muted-foreground"
                          )}
                        >
                          <Check className={cn("size-3", hasMinLength ? "opacity-100" : "opacity-30")} />
                          <span>6+ chars</span>
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1",
                            hasLetters && hasNumbers
                              ? "bg-primary/10 border-primary text-primary font-bold"
                              : "bg-secondary border-border text-muted-foreground"
                          )}
                        >
                          <Check className={cn("size-3", hasLetters && hasNumbers ? "opacity-100" : "opacity-30")} />
                          <span>Letters & Numbers</span>
                        </span>
                        {password && (
                          <span className="ml-auto text-[10px] text-muted-foreground">
                            {passwordStrength.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs">
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="mt-0.5 size-4 rounded border-border bg-background text-primary focus:ring-primary cursor-pointer accent-primary"
                        />
                        <span className="font-body text-muted-foreground">
                          I agree to the{" "}
                          <span className="text-foreground underline font-bold">Terms of Service</span> and{" "}
                          <span className="text-foreground underline font-bold">Safety Protocols</span>.
                        </span>
                      </label>
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
                            <span className="font-mono">PROVISIONING...</span>
                          </motion.div>
                        ) : (
                          <motion.span
                            key="btn-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {role === "admin"
                              ? "REGISTER ADMIN →"
                              : role === "staff"
                              ? "REGISTER STAFF →"
                              : "CREATE ACCOUNT →"}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </form>

                  <div className="text-center text-xs text-muted-foreground font-body pt-2 border-t border-border">
                    Already have an account?{" "}
                    <Link to={`/login?portal=${role}`} className="text-foreground hover:underline font-bold">
                      Sign in here
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}