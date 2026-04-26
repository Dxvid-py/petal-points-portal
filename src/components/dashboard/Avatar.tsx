interface AvatarProps {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  ring?: boolean;
}

const sizeMap = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-24 w-24 text-2xl",
};

export function Avatar({ name, url, size = "md", ring = false }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "·";

  const ringClass = ring ? "ring-2 ring-gold ring-offset-2 ring-offset-background" : "";

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${sizeMap[size]} shrink-0 rounded-full object-cover ${ringClass}`}
      />
    );
  }

  return (
    <span
      className={`${sizeMap[size]} flex shrink-0 items-center justify-center rounded-full bg-gradient-terracotta font-serif font-semibold text-terracotta-foreground ${ringClass}`}
    >
      {initials}
    </span>
  );
}
