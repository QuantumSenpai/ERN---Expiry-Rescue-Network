import ScrollReveal from "@/components/ScrollReveal";
import { Code2, Cpu } from "lucide-react";

const TEAM_MEMBERS = [
  {
    name: "Md Danish Raza",
    image: "/team/danish.jpg",
    role: "Project Co-Creator",
    focus: "Product & Architecture",
    icon: Code2,
  },
  {
    name: "Krishnendu Adak",
    image: "/team/krishnendu.jpg",
    role: "Project Co-Creator",
    focus: "Systems & Engineering",
    icon: Cpu,
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto relative scroll-mt-20 font-sans">
      <ScrollReveal direction="up">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card text-foreground text-xs font-mono mb-3 font-semibold uppercase shadow-none border border-[#2F4156]/25">
            CREATORS
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground font-bold leading-[1.15] tracking-[-0.02em]">
            <span className="font-sans block">The architectural minds</span>
            <span className="font-script text-4xl sm:text-5xl md:text-6xl text-foreground block font-bold mt-1">
              behind ERN.
            </span>
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base font-sans font-normal max-w-lg mx-auto leading-relaxed">
            Architected to eliminate inventory loss and empower companies with automated expiry intelligence.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
        {TEAM_MEMBERS.map((member, idx) => {
          const Icon = member.icon;
          return (
            <ScrollReveal
              key={member.name}
              direction="up"
              delay={idx * 120}
              className="h-full"
            >
              <div
                className="bg-card border border-[#2F4156]/20 p-7 sm:p-8 rounded-2xl sm:rounded-[32px] h-full flex flex-col items-center text-center group transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary dark:hover:border-primary shadow-none"
              >
                {/* Profile Photo */}
                <div className="relative size-28 sm:size-32 rounded-2xl overflow-hidden border border-[#2F4156]/20 group-hover:border-primary dark:group-hover:border-primary transition-all duration-200 mb-5 bg-card">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h3 className="font-sans text-xl font-bold text-foreground">
                    {member.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-card text-foreground text-xs font-mono font-bold">
                    <Icon className="size-3 text-foreground" />
                    <span>{member.role}</span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground pt-1">
                    {member.focus}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
