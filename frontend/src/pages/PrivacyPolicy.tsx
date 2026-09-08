import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Database, Mail, FileText, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors px-4 py-2 rounded-full border border-border bg-background shadow-none mb-6"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Network Home</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 text-secondary-foreground text-xs font-mono font-medium mb-4 border border-border">
            <ShieldCheck className="size-3.5 text-primary" />
            <span>GOVERNANCE & DATA COMPLIANCE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading mb-3">
            Privacy Policy & Data Ethics
          </h1>

          <p className="text-muted-foreground font-sans text-sm sm:text-base leading-relaxed">
            ERN (Expiry Rescue Network) connects grocery donors, food banks, NGOs, and conscious shoppers to rescue surplus inventory before expiration. This privacy charter details how your data is collected, secured, and strictly protected.
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span>Effective Date: September 8, 2026</span>
            <span>•</span>
            <span>Version 2.4.0 (Neon Postgres Edition)</span>
          </div>
        </div>

        <div className="space-y-10 font-sans leading-relaxed text-sm sm:text-base text-foreground/90">
          <section className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
            <div className="flex items-center gap-3 text-primary font-heading font-bold text-lg">
              <Database className="size-5" />
              <h2>1. Information We Collect at Registration</h2>
            </div>
            <p>
              When onboarding onto the Expiry Rescue Network, we collect the minimal operational data required to establish authenticated role access and audit trails:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm font-sans">
              <li>
                <strong className="text-foreground">Full Name / Organization Name:</strong> To identify retail donors, institutional buyers (NGOs, orphanages), and individual shoppers.
              </li>
              <li>
                <strong className="text-foreground">Email Address:</strong> Used as your unique account credential, for session recovery, and transactional claim alerts.
              </li>
              <li>
                <strong className="text-foreground">Account Role:</strong> Either <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">donor</code> (store/retailer) or <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">buyer</code> (rescue recipient).
              </li>
              <li>
                <strong className="text-foreground">Buyer Classification:</strong> Categorized as <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">individual</code>, <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">ngo</code>, or <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">orphanage</code> for mission-based priority distribution.
              </li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
            <div className="flex items-center gap-3 text-primary font-heading font-bold text-lg">
              <FileText className="size-5" />
              <h2>2. How Listings & Claim Data Are Used</h2>
            </div>
            <p>
              Information regarding perishable inventory lots (product titles, original retail pricing, expiration dates, stock quantities, and clearance markdowns) is aggregated to power the live marketplace.
            </p>
            <p className="text-sm text-muted-foreground">
              When a buyer initiates a rescue claim:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-border/60 bg-background flex flex-col gap-2">
                <span className="font-mono text-xs font-bold text-primary uppercase">Donor Visibility</span>
                <p className="text-xs text-muted-foreground">
                  The listing donor receives the buyer's organization name and pickup telemetry to facilitate handoff and verification.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border/60 bg-background flex flex-col gap-2">
                <span className="font-mono text-xs font-bold text-primary uppercase">Buyer Receipts</span>
                <p className="text-xs text-muted-foreground">
                  The buyer receives an unalterable order dispatch manifest with lot verification IDs and pickup deadlines.
                </p>
              </div>
            </div>
          </section>

          <section className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
            <div className="flex items-center gap-3 text-primary font-heading font-bold text-lg">
              <Lock className="size-5" />
              <h2>3. Cryptographic Security & Password Hashing</h2>
            </div>
            <p>
              Security is built into our core database architecture:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">One-Way Salted Bcrypt Hashing:</strong> Passwords are cryptographically hashed using industry-standard bcrypt algorithms before persisting to our database. Plaintext passwords never touch our logs or tables.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Stateless HS256 JWT Authentication:</strong> API sessions are secured via cryptographic JSON Web Tokens with strict 7-day lifespans and constant-time signature verification.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">SSL Transport Encryption:</strong> All database queries to Neon Serverless Postgres are enforced with strict <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">sslmode=require</code> transport-layer encryption.
                </p>
              </div>
            </div>
          </section>

          <section className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
            <div className="flex items-center gap-3 text-primary font-heading font-bold text-lg">
              <EyeOff className="size-5" />
              <h2>4. Zero Third-Party Data Monetization</h2>
            </div>
            <p>
              <strong className="text-foreground">ERN does not sell, lease, rent, or trade your personal or institutional data to any commercial advertisers or data brokers.</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Our network exists solely to eliminate food waste, feed communities, and restore economic balance. Telemetry metrics gathered across the platform are strictly aggregated for regional surplus impact reporting and public rescue dashboards.
            </p>
          </section>

          <section className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
            <div className="flex items-center gap-3 text-primary font-heading font-bold text-lg">
              <Mail className="size-5" />
              <h2>5. Privacy Inquiries & Data Rights</h2>
            </div>
            <p>
              Under applicable data protection frameworks, you have the right to inspect, export, or request permanent deletion of your profile and associated listings.
            </p>
            <div className="p-4 rounded-xl border border-border/80 bg-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-sm font-heading">Data Protection Officer</p>
                <p className="text-xs font-mono text-muted-foreground">privacy@ern-network.com</p>
              </div>
              <a
                href="mailto:privacy@ern-network.com"
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-mono text-xs uppercase font-bold hover:opacity-90 transition-opacity"
              >
                Submit Privacy Request
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
