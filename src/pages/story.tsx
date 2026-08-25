import Link from "next/link";
import { motion } from "framer-motion";
import { InnerPage } from "@/components/InnerPage";
import { EditorialSection } from "@/components/EditorialSection";
import { PhilosophySection } from "@/components/PhilosophySection";

export default function StoryPage() {
  return (
    <InnerPage
      title="STORY"
      kicker="THE HOUSE — EST. 2026"
      description="UNBOUND is a state of mind. Movement, individuality, and the refusal of conventional boundaries."
    >
      <section className="px-5 pb-20 md:px-10 md:pb-28">
        <motion.p
          className="max-w-2xl font-serif text-2xl italic leading-snug text-ivory md:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Not made to follow. Cut for those who move without asking.
        </motion.p>
        <motion.p
          className="mt-10 max-w-xl text-sm leading-8 text-mist"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          UNBOUND began as a refusal — of the prescribed silhouette, of clothing that performs
          stillness. Collection 001 is the first argument: dark, precise, and built around the
          space the body occupies in motion.
        </motion.p>
      </section>

      <EditorialSection />
      <PhilosophySection />

      <section className="flex flex-col items-center gap-8 px-5 py-28 text-center md:py-40">
        <p className="text-[10px] tracking-[0.36em] text-mist">CONTINUE</p>
        <div className="flex flex-wrap justify-center gap-10 text-[11px] tracking-[0.28em] text-ivory">
          <Link href="/shop" data-cursor="SHOP">
            SHOP
          </Link>
          <Link href="/contact" data-cursor="VIEW">
            CONTACT
          </Link>
        </div>
      </section>
    </InnerPage>
  );
}
