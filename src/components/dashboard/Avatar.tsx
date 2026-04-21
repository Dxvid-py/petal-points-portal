interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  ring?: boolean;
}

const sizeMap = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-24 w-24 text-2xl",
};

export function Avatar({ name, size = "md", ring = false }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={`${sizeMap[size]} flex shrink-0 items-center justify-center rounded-full bg-gradient-terracotta font-serif font-semibold text-terracotta-foreground ${
        ring ? "ring-2 ring-gold ring-offset-2 ring-offset-background" : ""
      }`}
    >
      {initials}
    </span>
  );
}
