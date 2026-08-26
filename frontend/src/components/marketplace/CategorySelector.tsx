import { motion } from "framer-motion";
import { CATEGORIES, type CategoryItem } from "@/data/marketplaceData";

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

const categoryContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const categoryItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

export default function CategorySelector({
  selectedCategory,
  onSelectCategory,
}: CategorySelectorProps) {
  return (
    <section className="py-5 px-4 sm:px-6 lg:px-8 border-b border-border bg-background text-foreground font-body">
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          variants={categoryContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none"
        >
          {CATEGORIES.map((cat: CategoryItem) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <motion.button
                key={cat.id}
                variants={categoryItemVariants}
                type="button"
                onClick={() => onSelectCategory(cat.slug)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-colors duration-200 cursor-pointer shrink-0 min-w-[80px] group ${
                  isSelected
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`size-12 rounded-full flex items-center justify-center text-xl transition-all duration-200 ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-card group-hover:bg-[#c4c7c4]/40 text-foreground"
                  }`}
                >
                  {cat.icon}
                </div>
                <span className="text-xs font-mono tracking-tight text-center">{cat.name}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
