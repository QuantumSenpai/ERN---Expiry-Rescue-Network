import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff as EyeClosed, ShieldCheck, UserCheck, Users } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useAuth, type Role, getRoleHomeRoute } from '@/context/AuthContext';
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

type AccessRole = "admin" | "staff" | "user";

const ROLE_PRESETS: Record<AccessRole, { email: string; name: string; authRole: Role; redirect: string }> = {
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

export function SignInCard({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<AccessRole>("admin");
  const [email, setEmail] = useState("admin@enterprise.io");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
      if (onSuccess) onSuccess();
    }, 700);
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
              {/* Header Section */}
              <div className="text-center space-y-2 mb-6">
                {/* Brand Logo */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="flex justify-center mb-2"
                >
                  <BrandLogo variant="auto" size="md" showText={false} />
                </motion.div>

                {/* Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-2xl font-bold font-display text-foreground leading-tight"
                >
                  Welcome Back
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="text-muted-foreground text-xs sm:text-[13px] font-sans font-normal leading-relaxed"
                >
                  Sign in to your ERN workspace
                </motion.p>
              </div>

              {/* Role Selection (SIGN IN AS) */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="mb-5 p-2 rounded-2xl bg-secondary/70 border border-border/80"
              >
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold mb-1.5 text-center">
                  SIGN IN AS
                </p>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                  {/* Admin Option */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("admin")}
                    className={cn(
                      "py-1.5 px-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 font-bold",
                      selectedRole === "admin"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/60 font-medium"
                    )}
                  >
                    <ShieldCheck className="size-3.5" />
                    <span>Admin</span>
                  </button>

                  {/* Staff Option */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("staff")}
                    className={cn(
                      "py-1.5 px-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 font-bold",
                      selectedRole === "staff"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/60 font-medium"
                    )}
                  >
                    <UserCheck className="size-3.5" />
                    <span>Staff</span>
                  </button>

                  {/* User Option */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("user")}
                    className={cn(
                      "py-1.5 px-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 font-bold",
                      selectedRole === "user"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/60 font-medium"
                    )}
                  >
                    <Users className="size-3.5" />
                    <span>User</span>
                  </button>
                </div>
              </motion.div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Address */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.25 }}
                  className="space-y-1"
                >
                  <label className="block text-xs font-semibold text-foreground/90 font-sans">
                    Email address
                  </label>
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
                      onBlur={() => setFocusedInput(null)}
                      required
                      className="pl-10 pr-3 bg-card/80 border-border text-foreground placeholder:text-muted-foreground font-body text-sm"
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.3 }}
                  className="space-y-1"
                >
                  <label className="block text-xs font-semibold text-foreground/90 font-sans">
                    Password
                  </label>
                  <div className="relative flex items-center rounded-xl">
                    <Lock
                      className={`absolute left-3.5 size-4 transition-colors duration-200 ${
                        focusedInput === "password" ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                      required
                      className="pl-10 pr-10 bg-card/80 border-border text-foreground placeholder:text-muted-foreground font-body text-sm"
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
                </motion.div>

                {/* Remember Me / Forgot Password */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.35 }}
                  className="flex items-center justify-between pt-0.5 text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-border bg-card text-primary focus:ring-primary cursor-pointer accent-[#2F4156] dark:accent-[#C8D9E6]"
                    />
                    <span className="font-sans text-muted-foreground hover:text-foreground transition-colors font-normal">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      alert("Password reset instructions sent to your email!");
                    }}
                    className="font-sans text-primary hover:underline font-semibold transition-colors cursor-pointer bg-transparent border-0 p-0"
                  >
                    Forgot password?
                  </button>
                </motion.div>

                {/* Primary CTA: Sign In → */}
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.4 }}
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group/button mt-2 cursor-pointer"
                >
                  <div className="relative overflow-hidden bg-primary text-primary-foreground hover:bg-[#567C8D] font-bold h-11 rounded-xl transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm font-mono font-medium">Authenticating...</span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="button-text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2 text-sm font-bold"
                        >
                          <span>Sign In →</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.45 }}
                  className="relative my-3 flex items-center"
                >
                  <div className="flex-grow border-t border-border" />
                  <span className="mx-3 text-[11px] font-mono text-muted-foreground uppercase font-medium">
                    or
                  </span>
                  <div className="flex-grow border-t border-border" />
                </motion.div>

                {/* Google Sign In */}
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.5 }}
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    login({
                      id: Date.now(),
                      name: "Enterprise Admin",
                      email: "admin@enterprise.io",
                      role: "admin",
                    });
                    navigate("/admin/dashboard");
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

                {/* Sign up link */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="text-center text-xs font-sans text-muted-foreground mt-4 font-normal"
                >
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-primary hover:underline font-bold transition-colors ml-1"
                  >
                    Sign up
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

export { SignInCard as Component };
export default SignInCard;
