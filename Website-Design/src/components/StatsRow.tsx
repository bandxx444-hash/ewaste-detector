const stats = [
  { value: "50K+", label: "Devices Scanned" },
  { value: "$2.1M", label: "Value Recovered" },
  { value: "1.2M lbs", label: "CO₂ Saved" },
  { value: "4.9★", label: "User Rating" },
];

const StatsRow = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
    {stats.map((s) => (
      <div key={s.label} className="glass-card text-center py-6 px-4">
        <div className="text-2xl md:text-3xl font-display font-bold gradient-text mb-1">{s.value}</div>
        <div className="text-xs font-medium text-subtle font-sans">{s.label}</div>
      </div>
    ))}
  </div>
);

export default StatsRow;
