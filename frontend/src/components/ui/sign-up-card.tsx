import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Mail,
  Lock,
  Building2,
  Eye,
  EyeOff as EyeClosed,
  ShieldCheck,
  Check,
  Boxes,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/context/AuthContext';
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10.5 w-full min-w-0 rounded-xl border bg-transparent px-3 py-2 text-sm shadow-xs transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

// Password strength calculator helper
function getPasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: "", color: "bg-muted" };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score === 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
  if (score === 2) return { score: 2, label: "Medium", color: "bg-amber-500" };
  return { score: 3, label: "Strong", color: "bg-emerald-500" };
}

export function SignUpCard({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { login } = useAuth();
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

  // Field touch tracking for inline validation
  const [touched, setTouched] = useState<{ orgName?: boolean; email?: boolean; password?: boolean; agreed?: boolean }>({});

  const passwordStrength = getPasswordStrength(password);

  // Standard email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isOrgValid = orgName.trim().length > 0;
  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = password.length >= 8;
  const isFormComplete = isOrgValid && isEmailValid && isPasswordValid && agreed;

  // Subtle 3D Card Hover Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [2, -2]);
  const rotateY = useTransform(mouseX, [-300, 300], [-2, 2]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

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
      setIsLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        login({
          id: Date.now(),
          name: orgName.trim(),
          email: email.trim(),
          role: "retailer",
        });
        navigate("/retailer/dashboard");
        if (onSuccess) onSuccess();
      }, 1000);
    }, 900);
  };

  return (
    <div className="relative w-full flex items-center justify-center py-6 px-4">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[70vw] h-[40vh] rounded-full bg-[#567C8D]/20 dark:bg-[#C8D9E6]/10 blur-[110px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[50vh] rounded-full bg-[#2F4156]/20 dark:bg-[#567C8D]/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          transition={{ type: "spring", stiffness: 120, damping: 25 }}
        >
          <div className="relative group">
            {/* Glass card background */}
            <div className="relative ern-liquid-glass rounded-3xl p-7 sm:p-9 border border-border shadow-2xl overflow-hidden backdrop-blur-2xl ern-card-glow">
              {/* Header section */}
              <div className="text-center space-y-2 mb-6">
                {/* 1. ERN Mark */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="flex justify-center mb-2"
                >
                  <BrandLogo variant="auto" size="md" showText={false} />
                </motion.div>

                {/* 2. Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border text-foreground text-[11px] font-mono mb-1 font-bold"
                >
                  <ShieldCheck className="size-3 text-primary" />
                  <span>UNIFIED INVENTORY INTELLIGENCE</span>
                </motion.div>

                {/* 3. Heading & Supporting Text */}
                <motion.h1
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="text-2xl sm:text-[1.7rem] font-bold font-display text-foreground leading-tight"
                >
                  Create Your Workspace
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="text-muted-foreground text-xs sm:text-[13px] font-sans font-normal leading-relaxed max-w-xs mx-auto"
                >
                  Set up your organization to manage inventory and expiry intelligence in one place.
                </motion.p>
              </div>

              {/* Error Banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-destructive/15 border border-destructive/40 text-destructive text-xs font-mono flex items-center gap-2"
                >
                  <span className="size-1.5 rounded-full bg-destructive animate-ping" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Field 1: Organization / Company Name */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.25 }}
                  className="space-y-1"
                >
                  <label className="block text-xs font-semibold text-foreground/90 font-sans">
                    Organization / Company Name
                  </label>
                  <div className="relative flex items-center rounded-xl">
                    <Building2
                      className={`absolute left-3.5 size-4 transition-colors duration-200 ${
                        focusedInput === "orgName" ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <Input
                      type="text"
                      placeholder="Enter your organization name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      onFocus={() => setFocusedInput("orgName")}
                      onBlur={() => {
                        setFocusedInput(null);
                        setTouched((prev) => ({ ...prev, orgName: true }));
                      }}
                      className={cn(
                        "pl-10 pr-3 bg-card/80 border-border text-foreground placeholder:text-muted-foreground font-body text-sm",
                        touched.orgName && !isOrgValid && "border-destructive focus-visible:border-destructive"
                      )}
                    />
                  </div>
                  {touched.orgName && !isOrgValid && (
                    <p className="text-[11px] text-destructive font-mono pl-1">
                      Organization name is required.
                    </p>
                  )}
                </motion.div>

                {/* Field 2: Email Address */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.3 }}
                  className="space-y-1"
                >
                  <div className="flex justify-between items-baseline">
                    <label className="block text-xs font-semibold text-foreground/90 font-sans">
                      Email Address
                    </label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Use an email address you can access
                    </span>
                  </div>
                  <div className="relative flex items-center rounded-xl">
                    <Mail
                      className={`absolute left-3.5 size-4 transition-colors duration-200 ${
                        focusedInput === "email" ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => {
                        setFocusedInput(null);
                        setTouched((prev) => ({ ...prev, email: true }));
                      }}
                      className={cn(
                        "pl-10 pr-3 bg-card/80 border-border text-foreground placeholder:text-muted-foreground font-body text-sm",
                        touched.email && !isEmailValid && "border-destructive focus-visible:border-destructive"
                      )}
                    />
                  </div>
                  {touched.email && !isEmailValid && (
                    <p className="text-[11px] text-destructive font-mono pl-1">
                      Enter a valid email address.
                    </p>
                  )}
                </motion.div>

                {/* Field 3: Create Password */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.35 }}
                  className="space-y-1"
                >
                  <label className="block text-xs font-semibold text-foreground/90 font-sans">
                    Create Password
                  </label>
                  <div className="relative flex items-center rounded-xl">
                    <Lock
                      className={`absolute left-3.5 size-4 transition-colors duration-200 ${
                        focusedInput === "password" ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => {
                        setFocusedInput(null);
                        setTouched((prev) => ({ ...prev, password: true }));
                      }}
                      className={cn(
                        "pl-10 pr-10 bg-card/80 border-border text-foreground placeholder:text-muted-foreground font-body text-sm",
                        touched.password && !isPasswordValid && "border-destructive focus-visible:border-destructive"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-1"
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
                  {password.length > 0 && (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex gap-1.5 h-1 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            passwordStrength.score >= 1 ? passwordStrength.color : "bg-transparent",
                            "w-1/3"
                          )}
                        />
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            passwordStrength.score >= 2 ? passwordStrength.color : "bg-transparent",
                            "w-1/3"
                          )}
                        />
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            passwordStrength.score >= 3 ? passwordStrength.color : "bg-transparent",
                            "w-1/3"
                          )}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10.5px] font-mono text-muted-foreground">
                        <span>Password strength</span>
                        <span className="font-semibold text-foreground">{passwordStrength.label}</span>
                      </div>
                    </div>
                  )}

                  {touched.password && !isPasswordValid && (
                    <p className="text-[11px] text-destructive font-mono pl-1">
                      Password must be at least 8 characters.
                    </p>
                  )}
                </motion.div>

                {/* Subtle ERN Product Context Helper Line */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.38 }}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-secondary/40 border border-border/50 text-[11px] font-mono text-muted-foreground"
                >
                  <Boxes className="size-3 text-primary shrink-0" />
                  <span className="truncate">Manage both expiry-tracked &amp; non-expiry inventory in one workspace.</span>
                </motion.div>

                {/* Terms Checkbox */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.4 }}
                  className="flex items-start gap-2 pt-1"
                >
                  <input
                    id="signup-terms"
                    name="signup-terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-border bg-card text-primary focus:ring-primary cursor-pointer accent-[#2F4156] dark:accent-[#C8D9E6]"
                  />
                  <label
                    htmlFor="signup-terms"
                    className="text-xs font-sans text-muted-foreground cursor-pointer leading-tight font-normal"
                  >
                    I agree to ERN's{" "}
                    <span className="text-foreground hover:underline font-semibold">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="text-foreground hover:underline font-semibold">
                      Privacy Policy
                    </span>
                    .
                  </label>
                </motion.div>

                {/* Primary CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.45 }}
                  whileHover={isFormComplete && !isLoading && !isSuccess ? { y: -1, scale: 1.01 } : {}}
                  whileTap={isFormComplete && !isLoading && !isSuccess ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={!isFormComplete || isLoading || isSuccess}
                  className={cn(
                    "w-full relative group/button mt-3 cursor-pointer transition-opacity duration-200",
                    !isFormComplete && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <div className="relative overflow-hidden bg-primary text-primary-foreground hover:bg-[#567C8D] font-bold h-11 rounded-xl transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg">
                    <AnimatePresence mode="wait">
                      {isSuccess ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Check className="size-4" />
                          <span>Workspace Created! Redirecting...</span>
                        </motion.div>
                      ) : isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm font-mono font-medium">Creating Workspace...</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="button-text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2 text-sm font-bold"
                        >
                          <span>Create Workspace →</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.5 }}
                  className="relative my-3 flex items-center"
                >
                  <div className="flex-grow border-t border-border" />
                  <span className="mx-3 text-[11px] font-mono text-muted-foreground uppercase font-medium">
                    or
                  </span>
                  <div className="flex-grow border-t border-border" />
                </motion.div>

                {/* Google Sign Up */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.55 }}
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    login({
                      id: Date.now(),
                      name: "Enterprise Workspace",
                      email: "admin@enterprise.io",
                      role: "retailer",
                    });
                    navigate("/retailer/dashboard");
                  }}
                  className="w-full relative cursor-pointer group/google"
                >
                  <div className="relative overflow-hidden bg-secondary text-foreground font-semibold h-10.5 rounded-xl border border-border hover:bg-muted transition-all duration-200 flex items-center justify-center gap-2.5 text-xs font-mono shadow-2xs">
                    <svg className="size-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </div>
                </motion.button>

                {/* Login link */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center text-xs font-sans text-muted-foreground mt-4 font-normal"
                >
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-bold transition-colors ml-1"
                  >
                    Log in
                  </Link>
                </motion.p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SignUpCard;
