const particles = [
  { left: "4%",  delay: "0s",   dur: "7s",  size: 5 },
  { left: "10%", delay: "2.3s", dur: "9s",  size: 4 },
  { left: "17%", delay: "1.1s", dur: "8s",  size: 6 },
  { left: "24%", delay: "4.2s", dur: "6.5s",size: 4 },
  { left: "31%", delay: "0.6s", dur: "10s", size: 5.5 },
  { left: "38%", delay: "3.0s", dur: "7.5s",size: 4.5 },
  { left: "45%", delay: "1.8s", dur: "8.5s",size: 4 },
  { left: "52%", delay: "5.1s", dur: "7s",  size: 5 },
  { left: "59%", delay: "0.4s", dur: "9.5s",size: 4 },
  { left: "65%", delay: "2.7s", dur: "8s",  size: 6 },
  { left: "72%", delay: "1.4s", dur: "6s",  size: 4.5 },
  { left: "78%", delay: "4.8s", dur: "10s", size: 4 },
  { left: "84%", delay: "0.9s", dur: "7.5s",size: 5 },
  { left: "90%", delay: "3.5s", dur: "9s",  size: 4 },
  { left: "96%", delay: "2.0s", dur: "8s",  size: 4.5 },
  { left: "7%",  delay: "6.0s", dur: "7s",  size: 4 },
  { left: "20%", delay: "5.5s", dur: "8.5s",size: 5.5 },
  { left: "43%", delay: "6.8s", dur: "9s",  size: 4 },
  { left: "68%", delay: "5.2s", dur: "7.5s",size: 4.5 },
  { left: "88%", delay: "7.1s", dur: "8s",  size: 5 },
];

const colors = [
  "hsl(153 70% 48%)",
  "hsl(43 75% 55%)",
  "hsl(153 55% 58%)",
  "hsl(43 65% 52%)",
];

const BackgroundOrbs = () => (
  <div className="fixed inset-0 pointer-events-none z-0" style={{ overflow: "visible" }}>
    {/* Gradient orbs — CSS blob animation */}
    <div className="absolute -top-40 -right-40 w-[700px] h-[500px] rounded-full opacity-[0.10] animate-blob"
      style={{ background: "radial-gradient(ellipse at 40% 50%, hsl(153 70% 45%), hsl(43 80% 55%) 50%, transparent 80%)", filter: "blur(80px)" }} />
    <div className="absolute top-1/2 -left-40 w-[600px] h-[450px] rounded-full opacity-[0.07] animate-blob"
      style={{ background: "radial-gradient(ellipse at 60% 40%, hsl(43 85% 55%), hsl(153 60% 40%) 60%, transparent 80%)", filter: "blur(70px)", animationDelay: "4s", animationDuration: "14s" }} />
    <div className="absolute -bottom-32 right-1/3 w-[400px] h-[300px] rounded-full opacity-[0.05] animate-blob"
      style={{ background: "radial-gradient(circle, hsl(153 70% 42%), transparent 70%)", filter: "blur(60px)", animationDelay: "8s", animationDuration: "18s" }} />

    {/* Subtle grid */}
    <div className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(hsl(153 70% 38% / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(153 70% 38% / 0.4) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }}
    />

    {/* Vignette */}
    <div className="absolute inset-0"
      style={{ background: "radial-gradient(ellipse at 50% 30%, transparent 40%, hsl(40 30% 96% / 0.55) 100%)" }}
    />

    {/* Top accent line */}
    <div className="absolute top-0 left-0 right-0 h-px"
      style={{ background: "linear-gradient(90deg, transparent, hsl(153 70% 38% / 0.2), hsl(43 75% 50% / 0.15), transparent)" }} />

    {/* Rising particles */}
    {particles.map((p, i) => (
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          left: p.left,
          bottom: "2px",
          width: `${p.size}px`,
          height: `${p.size}px`,
          background: colors[i % colors.length],
          boxShadow: `0 0 ${p.size * 2}px ${colors[i % colors.length]}`,
          animation: `particleRise ${p.dur} ${p.delay} linear infinite`,
          opacity: 0,
        }}
      />
    ))}
  </div>
);

export default BackgroundOrbs;
