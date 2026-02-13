import { useState, useEffect } from "react";
import { Sprout } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("visible"), 100);
    const exitTimer = setTimeout(() => setPhase("exit"), 2500);
    const completeTimer = setTimeout(onComplete, 3200);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-700 ease-out
        ${phase === "exit" ? "opacity-0 blur-lg scale-110" : "opacity-100"}
      `}
      style={{
        background:
          "radial-gradient(ellipse at center, hsl(215 15% 12%) 0%, hsl(215 15% 8%) 50%, hsl(215 15% 6%) 100%)",
      }}
    >
      {/* Ambient eco particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${6 + i * 3}px`,
              height: `${6 + i * 3}px`,
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 4) * 20}%`,
              background: `radial-gradient(circle, hsl(122 39% 49% / ${0.1 + i * 0.02}) 0%, transparent 70%)`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${4 + i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Breathing glow background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(circle at 50% 50%, hsl(122 39% 49% / 0.1) 0%, transparent 50%)",
          animation: "splash-breath 3s ease-in-out infinite",
        }}
      />

      {/* Logo container */}
      <div className="flex flex-col items-center gap-8 relative z-10">
        {/* Glowing logo circle */}
        <div
          className={`relative transition-all duration-800 ease-out
            ${phase === "enter" ? "opacity-0 scale-75" : "opacity-100 scale-100"}
          `}
        >
          {/* Multiple pulse rings */}
          <div 
            className="absolute inset-0 rounded-full animate-splash-pulse"
            style={{
              background: "radial-gradient(circle, hsl(122 39% 49% / 0.15) 0%, transparent 70%)",
              transform: "scale(1.8)",
            }}
          />
          <div
            className="absolute inset-0 rounded-full animate-splash-pulse"
            style={{
              background: "radial-gradient(circle, hsl(88 60% 50% / 0.1) 0%, transparent 60%)",
              transform: "scale(2.2)",
              animationDelay: "0.8s",
            }}
          />
          <div
            className="absolute inset-0 rounded-full animate-splash-pulse"
            style={{
              background: "radial-gradient(circle, hsl(122 50% 55% / 0.08) 0%, transparent 50%)",
              transform: "scale(2.6)",
              animationDelay: "1.6s",
            }}
          />

          {/* Glass circle container */}
          <div 
            className="relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500"
            style={{
              background: "hsl(215 15% 10% / 0.08)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid hsl(122 20% 30% / 0.2)",
              boxShadow: "0 8px 32px hsl(215 15% 10% / 0.4), 0 0 60px hsl(122 50% 55% / 0.15), inset 0 1px 0 hsl(255 255% 255% / 0.05)",
            }}
          >
            {/* Inner glow */}
            <div 
              className="absolute inset-2 rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(122 39% 49% / 0.1) 0%, transparent 60%)",
              }}
            />
            <Sprout className="w-16 h-16 relative z-10" style={{ color: "hsl(122 39% 49%)", filter: "drop-shadow(0 0 20px hsl(122 39% 49% / 0.4))" }} />
          </div>
        </div>

        {/* Text */}
        <div
          className={`text-center transition-all duration-800 delay-300 ease-out
            ${phase === "enter" ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"}
          `}
        >
          <h1 className="text-5xl font-bold tracking-tight mb-2">
            <span style={{ background: "linear-gradient(135deg, hsl(122 39% 49%) 0%, hsl(88 60% 50%) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              KisanSetu
            </span>
          </h1>
          <p className="text-lg tracking-wide" style={{ color: "hsl(120 8% 65%)" }}>
            The Farmer's Bridge
          </p>
        </div>

        {/* Enhanced loading dots */}
        <div
          className={`flex gap-3 transition-all duration-600 delay-500
            ${phase === "enter" ? "opacity-0" : "opacity-100"}
          `}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full animate-bounce"
              style={{
                background: "linear-gradient(135deg, hsl(122 39% 49%) 0%, hsl(88 60% 50%) 100%)",
                boxShadow: "0 0 15px hsl(122 39% 49% / 0.4)",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Leaf pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 10c-2 12-12 22-24 26 12 4 22 14 24 26 2-12 12-22 24-26-12-4-22-14-24-26z' fill='%234CAF50' fill-opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      <style jsx>{`
        @keyframes splash-breath {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};
