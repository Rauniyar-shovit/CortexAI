import { useTheme, type Theme } from "../utils/theme";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`flex gap-1 rounded-full bg-sf p-1 shadow-soft ${className}`}
    >
      {OPTIONS.map(({ value, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              active ? "bg-ink text-bg" : "text-mu hover:text-ink"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
