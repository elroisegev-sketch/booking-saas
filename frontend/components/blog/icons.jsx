// אייקוני קו (SVG, stroke=currentColor) — במקום אימוג'ים.
// כל אייקון יורש צבע וגודל מההורה; המיקרו-אנימציות מוגדרות ב-CSS של הבלוג.

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export function ClockIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

export function DiamondIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3.5 20 10l-8 10.5L4 10z" />
      <path d="M4 10h16M9 3.5 7 10m8-6.5 2 6.5" />
    </svg>
  );
}

export function LayersIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3.5 21 8l-9 4.5L3 8z" />
      <path d="M3 12l9 4.5L21 12M3 16l9 4.5L21 16" />
    </svg>
  );
}

export function ScissorsIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} {...base}>
      <circle cx="6" cy="6.5" r="2.5" />
      <circle cx="6" cy="17.5" r="2.5" />
      <path d="M8.2 8.2 20 17M8.2 15.8 20 7" />
    </svg>
  );
}

export function SparkIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3.5c.8 4 1.5 4.7 5.5 5.5-4 .8-4.7 1.5-5.5 5.5-.8-4-1.5-4.7-5.5-5.5 4-.8 4.7-1.5 5.5-5.5Z" />
      <path d="M18.5 15c.4 1.8.7 2.1 2.5 2.5-1.8.4-2.1.7-2.5 2.5-.4-1.8-.7-2.1-2.5-2.5 1.8-.4 2.1-.7 2.5-2.5Z" />
    </svg>
  );
}

export function SmileIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 13.5c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4" />
    </svg>
  );
}

export function PatchIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} {...base}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" transform="rotate(45 12 12)" />
      <path d="M12 9v6M9 12h6" />
    </svg>
  );
}

export function MapPinIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M12 21c4-4.2 6-7.4 6-10a6 6 0 1 0-12 0c0 2.6 2 5.8 6 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}

export function ShieldIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.4-7 9-4.1-1.6-7-4.7-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function HeartIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7-.3c0 4.9-7 9.3-7 9.3Z" />
    </svg>
  );
}

export function ChevronIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} {...base}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} {...base}>
      <path d="M19 12H5m6-7-7 7 7 7" />
    </svg>
  );
}

export function WhatsappIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.77.46 3.42 1.26 4.86L2 22l5.28-1.38c1.38.75 2.97 1.18 4.66 1.18h.01c5.52 0 10-4.48 10-10s-4.48-10-9.93-10z" />
    </svg>
  );
}

// בוחר אייקון לפי שם השירות (מבוסס מילות מפתח, כדי לשמור על ה-MDX נקי)
export function ServiceIcon({ service, className = "w-5 h-5" }) {
  const s = service || "";
  if (s.includes("בנייה") || s.includes("בניה")) return <LayersIcon className={className} />;
  if (s.includes("הסרה")) return <ScissorsIcon className={className} />;
  if (s.includes("השלמת")) return <PatchIcon className={className} />;
  if (s.includes("פרנץ")) return <SmileIcon className={className} />;
  if (s.includes("קישוט")) return <SparkIcon className={className} />;
  return <DiamondIcon className={className} />;
}
