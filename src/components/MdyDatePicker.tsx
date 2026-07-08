import { Label } from "@/components/ui/label";

interface Props {
  value: string | null; // ISO date "YYYY-MM-DD" or null
  onChange: (val: string | null) => void;
  label?: string;
}

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

export function MdyDatePicker({ value, onChange, label }: Props) {
  const now = new Date();
  const parts = value ? value.split("-") : ["", "", ""];
  const y = parts[0] ?? "";
  const m = parts[1] ?? "";
  const d = parts[2] ?? "";

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() + i);
  const daysIn = (yr: number, mo: number) => new Date(yr, mo, 0).getDate();
  const maxDay = y && m ? daysIn(parseInt(y), parseInt(m)) : 31;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const emit = (ny: string, nm: string, nd: string) => {
    if (!ny || !nm || !nd) { onChange(null); return; }
    const md = Math.min(parseInt(nd), daysIn(parseInt(ny), parseInt(nm)));
    onChange(`${ny}-${nm.padStart(2, "0")}-${String(md).padStart(2, "0")}`);
  };

  const selectClass =
    "rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div>
      {label && <Label className="text-xs">{label}</Label>}
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        <select value={m} onChange={(e) => emit(y, e.target.value, d)} className={selectClass} aria-label="Mes">
          <option value="">Mes</option>
          {MESES.map((name, i) => (
            <option key={i} value={String(i + 1).padStart(2, "0")}>{name}</option>
          ))}
        </select>
        <select value={d} onChange={(e) => emit(y, m, e.target.value)} className={selectClass} aria-label="Día">
          <option value="">Día</option>
          {days.map(n => <option key={n} value={String(n).padStart(2, "0")}>{n}</option>)}
        </select>
        <select value={y} onChange={(e) => emit(e.target.value, m, d)} className={selectClass} aria-label="Año">
          <option value="">Año</option>
          {years.map(n => <option key={n} value={String(n)}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}
