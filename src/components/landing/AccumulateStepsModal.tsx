import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const steps = [
  {
    n: "01",
    title: "Regístrate",
    desc: "Crea tu cuenta gratuita en menos de un minuto. Solo necesitas tu nombre, NIT y correo.",
  },
  {
    n: "02",
    title: "Explora",
    desc: "Revisa toda la variedad de productos y servicios que tenemos para ti al mejor precio.",
  },
  {
    n: "03",
    title: "Identifícate al comprar",
    desc: "Cada vez que realices una compra identifícate con tu código (o el de tu parroquia). En el instante tus puntos se verán reflejados en tu cuenta.",
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccumulateStepsModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-gold/20 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl text-foreground">
            Cómo <em className="text-gold">acumular</em> puntos
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tres pasos sencillos y empezarás a ganar puntos con cada compra.
          </DialogDescription>
        </DialogHeader>

        <ol className="mt-4 space-y-5">
          {steps.map((s) => (
            <li
              key={s.n}
              className="group flex gap-5 rounded-2xl border border-border/40 bg-background/40 p-5 transition-all hover:border-gold/40"
            >
              <span className="font-serif text-4xl font-bold text-shimmer-gold">
                {s.n}
              </span>
              <div>
                <h4 className="font-serif text-lg font-semibold text-foreground">
                  {s.title}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-2 rounded-xl border border-primary/30 bg-primary/10 p-4 text-center">
          <p className="text-sm text-foreground">
            <span className="font-semibold text-gold">1 punto</span> por cada{" "}
            <span className="font-semibold">$1.760 COP</span> de compra.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
