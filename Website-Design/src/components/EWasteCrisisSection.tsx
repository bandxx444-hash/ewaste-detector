import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

const crisisStats = [
  { value: "62M tonnes", label: "E-waste generated globally in 2023" },
  { value: "~1.8B", label: "New electronics sold every year" },
  { value: "$91B+", label: "In recoverable materials discarded annually" },
  { value: "< 20%", label: "Of e-waste formally recycled worldwide" },
];

const harmfulPoints = [
  "Toxic metals contaminate drinking water and damage ecosystems for decades.",
  "Improper burning releases dioxins and carcinogens, harming workers and nearby communities.",
  <>Manufacturing a single smartphone generates roughly <strong className="text-foreground">44 lbs of CO₂</strong> — discarding it wastes all of that embodied carbon.</>,
  "Rare earth minerals used in electronics are finite; landfilling them accelerates resource depletion.",
];

const helpPoints = [
  <>Extending a device's life by just <strong className="text-foreground">one year</strong> cuts its carbon footprint by up to 30%.</>,
  "Certified recyclers recover gold, silver, copper, and rare earths — reducing the need to mine new materials.",
  <>The global secondhand electronics market is projected to reach <strong className="text-foreground">$150B by 2030</strong>.</>,
  <>Every tonne of e-waste properly processed prevents roughly <strong className="text-foreground">2 tonnes of CO₂-equivalent</strong> emissions.</>,
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const EWasteCrisisSection = () => (
  <section className="relative z-10 mt-24">
    {/* Section background */}
    <div className="rounded-3xl px-6 md:px-12 py-14" style={{ background: "hsl(150 20% 92% / 0.6)" }}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {/* Header */}
        <motion.span variants={fadeUp} className="text-[11px] font-bold uppercase tracking-[3px] text-primary block mb-3 font-sans">
          The E-Waste Crisis
        </motion.span>
        <motion.h2 variants={fadeUp} className="text-3xl md:text-[42px] font-bold leading-tight mb-4 font-display">
          What is E-Waste — and Why Does It Matter?
        </motion.h2>
        <motion.p variants={fadeUp} className="text-body text-[15px] leading-relaxed max-w-4xl mb-12 font-sans">
          E-waste (electronic waste) is any discarded electronic device — phones, laptops, tablets, TVs, printers,
          and more. It's the world's fastest-growing solid waste stream, yet less than <strong className="text-foreground">20% is formally recycled</strong>.
          The rest ends up in landfills or is illegally exported, leaching toxic heavy metals like lead, mercury, and
          cadmium into soil and groundwater.
        </motion.p>

        {/* Stats row */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {crisisStats.map((s) => (
            <div key={s.value} className="rounded-2xl border border-border bg-card px-5 py-6 text-center">
              <div className="text-2xl md:text-3xl font-display font-bold gradient-text mb-2">{s.value}</div>
              <div className="text-xs text-subtle font-sans leading-snug">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-10 mb-14">
          {/* Why it's harmful */}
          <motion.div variants={fadeUp}>
            <h3 className="text-xl font-display font-bold mb-5">Why it's harmful</h3>
            <div className="space-y-4">
              {harmfulPoints.map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <ArrowRight className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                  <p className="text-sm text-body leading-relaxed font-sans">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* How reselling & recycling helps */}
          <motion.div variants={fadeUp}>
            <h3 className="text-xl font-display font-bold mb-5">How reselling &amp; recycling helps</h3>
            <div className="space-y-4">
              {helpPoints.map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <CheckCircle className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                  <p className="text-sm text-body leading-relaxed font-sans">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* How this tool helps */}
        <motion.div
          variants={fadeUp}
          className="rounded-2xl px-6 md:px-8 py-6 border-l-4"
          style={{ background: "hsl(150 20% 94%)", borderColor: "hsl(153 70% 38%)" }}
        >
          <h4 className="text-lg font-display font-bold mb-2">How this tool helps</h4>
          <p className="text-sm text-body leading-relaxed font-sans">
            Through AI-powered valuation and eBay listing generation, this platform helps you recover real value from devices
            that would otherwise be discarded — keeping electronics in use longer and out of landfills. Every scan is a step
            toward a circular economy.
          </p>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default EWasteCrisisSection;
