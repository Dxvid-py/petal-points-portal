import { Avatar } from "./Avatar";

interface PageHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  showAvatar?: boolean;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  showAvatar = true,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-6 border-b border-border/60 pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-terracotta">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {showAvatar && (
        <div className="flex items-center gap-3 self-start rounded-full border border-border bg-card px-3 py-2 md:self-auto">
          <Avatar name="Angie Restrepo" size="sm" />
          <div className="pr-3 leading-tight">
            <p className="text-xs font-medium text-foreground">Angie Restrepo</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Miembro desde Ene 2023
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
