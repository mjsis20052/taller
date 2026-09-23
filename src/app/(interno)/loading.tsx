// Se muestra al instante al cambiar de pantalla, mientras llegan los datos.
export default function Cargando() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="animate-pulse space-y-4">
      <div className="h-8 w-40 rounded-xl bg-borde" />
      <div className="h-4 w-64 rounded-lg bg-borde/70" />
      <div className="space-y-3 pt-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl border border-borde bg-superficie" />
        ))}
      </div>
    </div>
  );
}
