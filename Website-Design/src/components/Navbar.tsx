import { Leaf } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "My Dashboard", to: "/dashboard" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 h-[68px] shadow-nav flex items-center px-6 backdrop-blur-xl"
      style={{ background: "linear-gradient(90deg, hsl(0 0% 100% / 0.95), hsl(40 30% 97% / 0.95))", borderBottom: "1px solid hsl(150 15% 85%)" }}>
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center gradient-border"
            style={{ background: "linear-gradient(135deg, rgba(15,138,95,0.2), rgba(201,162,39,0.15))" }}>
            <Leaf className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[22px] font-display font-bold text-foreground">EcoLens</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 font-sans ${
                location.pathname === link.to
                  ? "text-foreground bg-secondary"
                  : "text-subtle hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/scan"
          className="px-5 py-2 rounded-full text-sm font-bold shadow-cta transition-all duration-200 hover:-translate-y-0.5 font-sans text-primary-foreground"
          style={{ background: "linear-gradient(135deg, hsl(153 70% 38%), hsl(153 70% 28%))" }}
        >
          Start Scan
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
