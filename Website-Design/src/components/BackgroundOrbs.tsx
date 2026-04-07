const BackgroundOrbs = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div
      className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full animate-blob"
      style={{ background: "radial-gradient(circle, rgba(15,138,95,0.06) 0%, transparent 70%)", filter: "blur(80px)" }}
    />
    <div
      className="absolute top-1/3 -left-20 w-[500px] h-[500px] rounded-full animate-blob"
      style={{ background: "radial-gradient(circle, rgba(201,162,39,0.04) 0%, transparent 70%)", filter: "blur(80px)", animationDelay: "4s" }}
    />
    <div
      className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full animate-blob"
      style={{ background: "radial-gradient(circle, rgba(15,138,95,0.03) 0%, transparent 70%)", filter: "blur(60px)", animationDelay: "8s" }}
    />
    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(15,138,95,0.15), rgba(201,162,39,0.1), transparent)" }} />
  </div>
);

export default BackgroundOrbs;
