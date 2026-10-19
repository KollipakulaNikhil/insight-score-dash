import { useSyncExternalStore } from "react";
import { MoonStar, Sun } from "lucide-react";

// Two looks for the whole app: "space" (deep night sky) and "dust" (warm sand). The choice is a
// data-theme attribute on <html>, remembered in this browser, and applied by a tiny script in the
// document head before the page paints so there is no flash.
export const THEME_KEY = "orbit-theme";
export const THEME_SCRIPT = `try{if(localStorage.getItem("${THEME_KEY}")==="dust")document.documentElement.dataset.theme="dust"}catch(e){}`;

const listeners = new Set();
const current = () => (document.documentElement.dataset.theme === "dust" ? "dust" : "space");

export function setTheme(next) {
  if (next === "dust") document.documentElement.dataset.theme = "dust";
  else delete document.documentElement.dataset.theme;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* storage blocked: the choice just lasts until reload */
  }
  listeners.forEach((l) => l());
}

export function ThemeToggle({ className = "" }) {
  const theme = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    current,
    () => "space",
  );
  const options = [
    { key: "space", label: "Space", icon: MoonStar },
    { key: "dust", label: "Dust", icon: Sun },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`inline-flex rounded-full border bg-muted/60 p-0.5 text-xs ${className}`}
    >
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={theme === o.key}
          onClick={() => setTheme(o.key)}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium transition-colors ${
            theme === o.key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <o.icon className="size-3.5" />
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
