import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ThemeMode } from "@/hooks/useTheme";

interface ThemeSwitcherProps {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
}

export const ThemeSwitcher = ({ mode, onModeChange }: ThemeSwitcherProps) => {
  const toggleTheme = () => {
    onModeChange(mode === "dark" ? "light" : "dark");
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="glass-subtle rounded-full border border-border/30 hover:border-primary/50 transition-all duration-300 group"
      onClick={toggleTheme}
      aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            mode === "light" 
              ? "opacity-100 rotate-0 scale-100 text-amber-500" 
              : "opacity-0 rotate-90 scale-0 text-foreground"
          }`} 
        />
        <Moon 
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            mode === "dark" 
              ? "opacity-100 rotate-0 scale-100 text-primary" 
              : "opacity-0 -rotate-90 scale-0 text-foreground"
          }`} 
        />
      </div>
    </Button>
  );
};
