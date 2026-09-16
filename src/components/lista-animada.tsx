"use client";

import { motion } from "framer-motion";

const contenedor = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.035 } },
};

const item = {
  oculto: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
};

export function ListaAnimada({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="oculto"
      animate="visible"
      variants={contenedor}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ItemAnimado({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
