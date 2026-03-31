interface SectionBadgeProps {
  children: React.ReactNode;
  color?: "orange" | "crimson" | "green" | "brown" | "navy";
  variant?: "pill" | "underline";
}

const PILL_COLORS = {
  orange: "text-orange bg-orange/10",
  crimson: "text-crimson bg-crimson/10",
  green: "text-green bg-green/10",
  brown: "text-brown bg-brown/10",
  navy: "text-navy bg-navy/10",
} as const;

const UNDERLINE_COLORS = {
  orange: "text-orange after:bg-orange",
  crimson: "text-crimson after:bg-crimson",
  green: "text-green after:bg-green",
  brown: "text-brown after:bg-brown",
  navy: "text-navy after:bg-navy",
} as const;

export function SectionBadge({ children, color = "orange", variant = "pill" }: SectionBadgeProps) {
  if (variant === "underline") {
    return (
      <span
        className={`relative inline-block font-heading text-sm font-semibold uppercase tracking-widest mb-6 pb-2 after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:rounded-full ${UNDERLINE_COLORS[color]}`}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-block font-heading text-sm font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 ${PILL_COLORS[color]}`}
    >
      {children}
    </span>
  );
}
