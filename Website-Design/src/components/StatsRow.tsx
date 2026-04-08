const EWasteSection = () => (
  <div className="mt-16 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
    <div
      className="rounded-3xl border border-border px-8 py-10 md:px-14 md:py-12 font-sans"
      style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.06), hsl(43 75% 50% / 0.04))" }}
    >
      {/* Header */}
      <div className="mb-8">
        <span className="text-[11px] font-bold uppercase tracking-[2px] gradient-text block mb-3">
          The E-Waste Crisis
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
          What is E-Waste — and Why Does It Matter?
        </h2>
        <p className="text-base text-body leading-relaxed max-w-3xl">
          E-waste (electronic waste) is any discarded electronic device — phones, laptops, tablets,
          TVs, printers, and more. It's the world's fastest-growing solid waste stream, yet less than
          <strong className="text-foreground"> 20% is formally recycled</strong>. The rest ends up
          in landfills or is illegally exported, leaching toxic heavy metals like lead, mercury, and
          cadmium into soil and groundwater.
        </p>
      </div>

      {/* Stat pills row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { value: "62M tonnes", label: "E-waste generated globally in 2023" },
          { value: "~1.8B", label: "New electronics sold every year" },
          { value: "$91B+", label: "In recoverable materials discarded annually" },
          { value: "< 20%", label: "Of e-waste formally recycled worldwide" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border px-4 py-4 text-center"
            style={{ background: "hsl(40 30% 97%)" }}
          >
            <div className="text-xl md:text-2xl font-display font-bold gradient-text mb-1">{s.value}</div>
            <div className="text-[11px] text-subtle leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two-column body */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-display font-bold text-foreground mb-2 text-[15px]">Why it's harmful</h3>
          <ul className="space-y-2 text-sm text-body leading-relaxed">
            <li className="flex gap-2"><span className="text-primary font-bold mt-0.5">→</span> Toxic metals contaminate drinking water and damage ecosystems for decades.</li>
            <li className="flex gap-2"><span className="text-primary font-bold mt-0.5">→</span> Improper burning releases dioxins and carcinogens, harming workers and nearby communities.</li>
            <li className="flex gap-2"><span className="text-primary font-bold mt-0.5">→</span> Manufacturing a single smartphone generates roughly <strong className="text-foreground">44 lbs of CO₂</strong> — discarding it wastes all of that embodied carbon.</li>
            <li className="flex gap-2"><span className="text-primary font-bold mt-0.5">→</span> Rare earth minerals used in electronics are finite; landfilling them accelerates resource depletion.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground mb-2 text-[15px]">How reselling & recycling helps</h3>
          <ul className="space-y-2 text-sm text-body leading-relaxed">
            <li className="flex gap-2"><span className="gradient-text font-bold mt-0.5">✓</span> Extending a device's life by just <strong className="text-foreground">one year</strong> cuts its carbon footprint by up to 30%.</li>
            <li className="flex gap-2"><span className="gradient-text font-bold mt-0.5">✓</span> Certified recyclers recover gold, silver, copper, and rare earths — reducing the need to mine new materials.</li>
            <li className="flex gap-2"><span className="gradient-text font-bold mt-0.5">✓</span> The global secondhand electronics market is projected to reach <strong className="text-foreground">$150B by 2030</strong>.</li>
            <li className="flex gap-2"><span className="gradient-text font-bold mt-0.5">✓</span> Every tonne of e-waste properly processed prevents roughly <strong className="text-foreground">2 tonnes of CO₂-equivalent</strong> emissions.</li>
          </ul>
        </div>
      </div>

      {/* Impact footer */}
      <div
        className="rounded-2xl border border-border px-6 py-5"
        style={{ background: "linear-gradient(135deg, hsl(153 70% 38% / 0.07), hsl(43 75% 50% / 0.05))" }}
      >
        <p className="text-sm font-semibold text-foreground mb-1">How this tool helps</p>
        <p className="text-xs text-subtle leading-relaxed">
          Through AI-powered valuation and eBay listing generation, this platform helps you recover
          real value from devices that would otherwise be discarded — keeping electronics in use
          longer and out of landfills. Every scan is a step toward a circular economy.
        </p>
      </div>
    </div>
  </div>
);

export default EWasteSection;
