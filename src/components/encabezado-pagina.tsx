export function EncabezadoPagina({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion?: string;
}) {
  return (
    <header className="mb-5">
      <h1 className="text-[26px] font-bold tracking-tight text-foreground">
        {titulo}
      </h1>
      {descripcion && (
        <p className="mt-1 text-[15px] leading-snug text-mutado">
          {descripcion}
        </p>
      )}
    </header>
  );
}
