// MXN currency formatter for the hey-banco demo.
// Outflows render with en-dash prefix (−), inflows with `+`.

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const mxnPlain = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMXN(amount: number): string {
  return mxn.format(amount);
}

export function formatTransaction(amount: number): string {
  if (amount < 0) return `−${mxnPlain.format(Math.abs(amount))}`;
  if (amount > 0) return `+${mxnPlain.format(amount)}`;
  return mxnPlain.format(0);
}

const dateFmt = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
});

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const ms = now.getTime() - d.getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return dateFmt.format(d);
}
