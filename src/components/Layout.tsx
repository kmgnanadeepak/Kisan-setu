import { NewsTicker } from "./NewsTicker";

interface LayoutProps {
  children: React.ReactNode;
  showNewsTicker?: boolean;
  showFloatingLeaves?: boolean;
}

export const Layout = ({ children, showNewsTicker = true, showFloatingLeaves = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Floating leaf ambient background */}
      {showFloatingLeaves && (
        <div className="ambient-leaves">
          <div className="leaf-shape"></div>
          <div className="leaf-shape"></div>
          <div className="leaf-shape"></div>
          <div className="leaf-shape"></div>
          <div className="leaf-shape"></div>
        </div>
      )}
      {showNewsTicker && <NewsTicker />}
      {children}
    </div>
  );
};
