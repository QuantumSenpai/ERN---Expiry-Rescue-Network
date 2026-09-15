import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  tag: string;
}

const FAQS: FaqItem[] = [
  {
    id: "faq-matching",
    tag: "MATCHING LOGIC",
    question: "How does the expiry-rescue matching engine work?",
    answer:
      "ERN continuously tracks multi-facility inventory batches by calculated remaining shelf-life. When lots approach defined risk horizons (such as 30, 14, or 7 days before expiry), ERN triggers automated clearance interventions and matches surplus batches directly with verified commercial buyers, retail discounters, and community rescue partners before stock converts to financial or physical waste.",
  },
  {
    id: "faq-eligibility",
    tag: "USER ROLES",
    question: "Who can sign up as a donor versus a buyer?",
    answer:
      "Donors include commercial supermarkets, FMCG manufacturers, wholesale distributors, and local food businesses looking to prevent write-offs. Buyers include verified commercial businesses, secondary discounters, registered NGOs, and community food rescue organizations seeking quality inventory at reduced costs. Both roles require quick business verification to maintain supply-chain integrity.",
  },
  {
    id: "faq-fees",
    tag: "TRANSPARENT PRICING",
    question: "Is there any fee to join the network or list products?",
    answer:
      "Joining ERN and listing surplus inventory is 100% free. We operate on a zero-barrier recovery mission: basic catalog management, shelf-life telemetry, automated markdown calculation, and community redistribution workflows incur zero onboarding fees and zero monthly subscription charges.",
  },
  {
    id: "faq-verification",
    tag: "SAFETY & COMPLIANCE",
    question: "How does account verification work?",
    answer:
      "Upon registration, donor organizations and buyer entities submit standard commercial or nonprofit credentials (such as tax identification, business license, or NGO registration). Our administrative compliance team audits submissions within 24 hours to ensure food safety standards, operational validity, and network trust before full purchasing is unlocked.",
  },
  {
    id: "faq-pricing",
    tag: "DYNAMIC MARKDOWNS",
    question: "How is markdown and discount pricing decided?",
    answer:
      "Donors maintain complete autonomous control through customizable automated discount rules. Rules define percentage markdowns linked directly to remaining days (e.g., 20% off at 30 days, 40% off at 14 days, and 60% off at 7 days). ERN's engine calculates and surfaces clearance prices dynamically in real time while allowing donors to adjust or override pricing at any moment.",
  },
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("faq-matching");

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 max-w-5xl mx-auto scroll-mt-20 font-sans">
      <ScrollReveal direction="up">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary text-foreground text-xs font-mono font-semibold mb-3.5 uppercase shadow-none border border-border">
            <HelpCircle className="size-3.5 text-accent" />
            <span>COMMON INQUIRIES & PROTOCOLS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-[1.15] tracking-[-0.02em] font-display">
            <span className="font-sans block">Everything you need</span>
            <span className="font-script text-4xl sm:text-5xl md:text-6xl text-foreground dark:text-primary block font-bold mt-1">
              to know about ERN.
            </span>
          </h2>

          <p className="mt-3 text-muted-foreground text-sm sm:text-base font-sans font-normal leading-relaxed">
            Clear answers on inventory integration, commercial eligibility, automated markdowns, and verified supply chain safety.
          </p>
        </div>
      </ScrollReveal>

      <div className="space-y-4">
        {FAQS.map((faq, index) => {
          const isOpen = openId === faq.id;
          return (
            <ScrollReveal key={faq.id} direction="up" delay={index * 60}>
              <div
                className={cn(
                  "bg-card border rounded-2xl sm:rounded-[24px] transition-all duration-300 overflow-hidden shadow-none",
                  isOpen
                    ? "border-primary/50 dark:border-primary/40 bg-card shadow-xs"
                    : "border-border hover:border-primary/30"
                )}
              >
                <button
                  type="button"
                  id={`faq-question-${faq.id}`}
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full text-left px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 w-fit">
                      {faq.tag}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground font-display tracking-tight">
                      {faq.question}
                    </h3>
                  </div>

                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ease-out",
                      isOpen
                        ? "rotate-180 bg-primary text-primary-foreground shadow-xs"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    )}
                  >
                    <ChevronDown className="size-4 transition-transform duration-300 ease-out" />
                  </div>
                </button>

                <div
                  id={`faq-answer-${faq.id}`}
                  role="region"
                  aria-labelledby={`faq-question-${faq.id}`}
                  className="grid transition-all duration-300 ease-out"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                    transitionProperty: "grid-template-rows, opacity",
                    transitionDuration: "300ms",
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 sm:px-8 pb-6 sm:pb-7 pt-2 text-muted-foreground text-sm leading-relaxed border-t border-border/50">
                      <p className="max-w-3xl">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
