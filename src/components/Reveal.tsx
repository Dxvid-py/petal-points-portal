import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: ReactNode;
  delay?: number;
  y?: number;
  /** Si es true, anima cuando aparece en viewport (scroll reveal). Si es false, anima al montar. */
  inView?: boolean;
  /** Clases del contenedor */
  className?: string;
}

/**
 * Wrapper liviano sobre framer-motion para hacer scroll-reveal consistente en todo el sitio.
 * Respeta `prefers-reduced-motion` automáticamente (framer-motion lo maneja).
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  inView = true,
  className,
  ...rest
}: RevealProps) {
  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      {...(inView
        ? { whileInView: "show", viewport: { once: true, margin: "-80px" } }
        : { animate: "show" })}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Stagger: úsalo como contenedor para escalonar hijos `<Reveal>` o `<motion.div>`. */
export function StaggerGroup({
  children,
  className,
  stagger = 0.12,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
  };
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}
