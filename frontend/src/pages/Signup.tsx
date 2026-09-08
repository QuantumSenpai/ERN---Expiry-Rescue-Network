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

function getPasswordStrength(pass: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!pass) return { score: 0, label: "", color: "bg-secondary" };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score === 1) return { score: 1, label: "Basic", color: "bg-destructive/60" };
  if (score === 2) return { score: 2, label: "Medium", color: "bg-secondary" };
  return { score: 3, label: "Strong", color: "bg-primary" };
}

export default function Signup() {
  const { signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [role, setRole] = useState<"donor" | "buyer">("donor");
  const [buyerType, setBuyerType] = useState<"individual" | "ngo" | "orphanage">("individual");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError("Please enter your organization or personal name.");
      return;
    }
    if (!cleanEmail) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
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
        buyer_type: role === "buyer" ? buyerType : undefined,
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
                    Account Registered
                  </h3>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-sm mx-auto">
                    Your registration has been submitted. In accordance with ERN safety standards, accounts require administrative verification before portal activation.
                  </p>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="w-full py-3 px-4 rounded-full bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Return to Sign In →
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary text-foreground text-xs font-mono font-bold uppercase">
                      <span>Get Started</span>
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl font-[400] text-foreground tracking-[-0.02em] leading-tight pt-1">
                      Create an account
                    </h2>

                    <p className="text-xs text-muted-foreground font-body">
                      Join ERN to monitor shelf life, prevent waste, or claim lots.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono flex items-start gap-2.5 animate-in fade-in">
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <div className="leading-snug font-sans">{error}</div>
                    </div>
                  )}

                  
                  <div className="p-1 rounded-full bg-secondary grid grid-cols-2 gap-1 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setRole("donor")}
                      className={cn(
                        "py-2 px-3 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 font-bold",
                        role === "donor"
                          ? "bg-primary text-primary-foreground shadow-none"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Store className="size-3.5" />
                      <span>Retailer / Donor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("buyer")}
                      className={cn(
                        "py-2 px-3 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 font-bold",
                        role === "buyer"
                          ? "bg-primary text-primary-foreground shadow-none"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Users className="size-3.5" />
                      <span>Buyer / Org</span>
                    </button>
                  </div>

                  
                  {role === "buyer" && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label className="block text-xs font-mono uppercase text-muted-foreground font-bold">
                        Buyer Organization Type
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

                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-muted-foreground font-bold">
                        {role === "donor" ? "Store or Organization Name" : "Full Name or Organization"}
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
                          placeholder={role === "donor" ? "e.g. Metro Supermarket" : "e.g. Priya Sharma or Hope Trust"}
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
                          placeholder="operations@organization.com"
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
                        Password (min 8 chars)
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
                            CREATE WORKSPACE →
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </form>

                  
                  <div className="text-center text-xs text-muted-foreground font-body pt-2 border-t border-border">
                    Already have an account?{" "}
                    <Link to="/login" className="text-foreground hover:underline font-bold">
                      Sign in
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