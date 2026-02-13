import { useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";

const agriNews = [
  "🌾 Wheat prices increased by ₹120 per quintal in Punjab markets today.",
  "🌧 IMD issues rainfall alert for South India farmers this week.",
  "🧪 New fungal infection detected in tomato crops – preventive spraying advised.",
  "💰 Government announces new MSP revision for Rabi crops.",
  "🌱 Organic farming subsidies expanded for small-scale farmers.",
  "🐛 Fall armyworm spreading in maize fields – advisory issued.",
  "🚜 New smart irrigation scheme launched for rural farmers.",
  "📈 Rice export demand increases global market price.",
  "⚠ Heatwave alert: Farmers advised to irrigate crops in early morning hours.",
  "🌿 Agricultural university releases new high-yield seed variety."
];

export const NewsTicker = () => {
  const [newsItems, setNewsItems] = useState(agriNews);
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Auto update effect - rotate news every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNewsItems(prev => {
        if (prev.length <= 1) return prev;
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // Combine all news items with separator and duplicate for seamless loop
  const tickerContent = newsItems.join("  |  ");
  const duplicatedContent = `${tickerContent}  |  ${tickerContent}`;

  return (
    <>
      <div 
        className="w-full overflow-hidden relative bg-gradient-to-r from-green-800 to-green-600"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-center h-[45px] md:h-[45px] px-4">
          {/* LIVE Label */}
          <div className="flex items-center gap-2 text-white font-medium text-sm md:text-base whitespace-nowrap z-10 bg-green-700/30 px-3 py-1 rounded-l-md">
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <span>LIVE</span>
            <span className="text-green-200">|</span>
            <span className="text-green-100">FARMER FLASH UPDATES</span>
          </div>
          
          {/* Marquee Container */}
          <div className="flex-1 overflow-hidden relative">
            <div 
              className="flex whitespace-nowrap"
              style={{
                animation: isPaused ? 'scroll-left-slow 50s linear infinite' : 'scroll-left 30s linear infinite',
                willChange: 'transform'
              }}
            >
              <span className="text-white text-sm md:text-base font-medium leading-[45px] inline-block">
                {duplicatedContent}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for continuous marquee animation */}
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-left-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Ensure smooth performance */
        .marquee-container {
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          @keyframes scroll-left {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          @keyframes scroll-left-slow {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        }
      `}</style>
    </>
  );
};
