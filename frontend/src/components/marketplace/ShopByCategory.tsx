import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, type CategoryItem } from "@/data/marketplaceData";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0, 0, 0.2, 1] as const },
  },
};

export default function ShopByCategory() {
  const visibleCategories = CATEGORIES.filter((c) => c.slug !== "all");

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-card/40 text-foreground font-body">
      <div className="max-w-[1440px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-mono font-bold uppercase mb-1">
              <span>EXPLORE AISLES</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-0.5">
              Browse everyday staples and expiry-discounted groceries across all departments
            </p>
          </div>

          <Link
            to="/customer/browse"
            className="text-xs font-mono font-bold uppercase text-foreground hover:text-primary transition-colors flex items-center gap-1 group py-1.5 px-3 rounded-full hover:bg-secondary border border-transparent hover:border-border"
          >
            <span>All Products</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {visibleCategories.map((cat: CategoryItem) => (
            <motion.div key={cat.id} variants={itemVariants}>
              <Link
                to={`/customer/browse?category=${encodeURIComponent(cat.slug)}`}
                className="group p-4 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-32 relative overflow-hidden block"
              >
                <div className="flex items-start justify-between">
                  <div className="size-11 rounded-xl bg-secondary/80 group-hover:bg-primary/15 group-hover:text-primary flex items-center justify-center text-2xl transition-colors duration-200 shrink-0">
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground font-medium px-2 py-0.5 rounded-full bg-secondary/50">
                    {cat.itemCount} items
                  </span>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono flex items-center gap-1 group-hover:text-foreground">
                    <span>Shop aisle</span>
                    <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
