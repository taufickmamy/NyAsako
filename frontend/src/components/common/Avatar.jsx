import { initialsOf } from "../../utils/roles";

const SIZES = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

const COLORS = [
  "bg-brand-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-600",
  "bg-indigo-500",
  "bg-teal-500",
];

function colorFor(name) {
  const sum = String(name || "")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[sum % COLORS.length];
}

/** Avatar à initiales, couleur déterministe à partir du nom. */
export default function Avatar({ name, size = "md", className = "", ring = false }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${SIZES[size]} ${colorFor(name)} ${
        ring ? "ring-2 ring-white dark:ring-slate-900" : ""
      } ${className}`}
      title={name}
      aria-label={name}
    >
      {initialsOf(name)}
    </span>
  );
}
