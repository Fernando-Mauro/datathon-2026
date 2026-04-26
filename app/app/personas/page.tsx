import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Wordmark } from "@/app/_components/Wordmark";
import { HaviRing } from "@/app/_components/HaviRing";
import { listPersonasPage, countPersonas } from "@/app/_data/personas.server";
import { PickerRow } from "./_picker-row";

const PAGE_SIZE = 10;

type Search = { page?: string };

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Math.max(1, Number(pageParam) || 1);

  const [items, total] = await Promise.all([
    listPersonasPage(requestedPage, PAGE_SIZE),
    countPersonas(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(requestedPage, totalPages);

  return (
    <main className="flex min-h-screen flex-col bg-hey-bg">
      <header className="hey-app-frame flex items-center justify-between px-4 py-6 lg:px-8">
        <Wordmark size="md" />
        <span className="hey-eyebrow">Modo administrador</span>
      </header>

      <section className="hey-app-frame flex flex-col gap-2 px-4 py-6 lg:px-8 lg:py-10">
        <p className="hey-eyebrow">Selecciona un usuario</p>
        <h1 className="font-serif text-[28px] font-bold leading-tight text-hey-fg-1 lg:text-[36px]">
          ¿Como quién entras a la conversación?
        </h1>
        <p className="mt-1 text-[14px] leading-snug text-hey-fg-2">
          HaviCA cambia su contexto financiero — saldo, movimientos, alertas — según la persona que elijas.
        </p>
      </section>

      <section className="hey-app-frame flex flex-col gap-2 px-4 lg:px-8">
        {items.map((item, i) => (
          <PickerRow key={item.id} item={item} index={i} />
        ))}
      </section>

      {totalPages > 1 ? (
        <nav
          aria-label="Paginación de usuarios"
          className="hey-app-frame mt-4 flex items-center justify-between gap-3 px-4 pb-12 lg:px-8"
        >
          <PageLink
            page={safePage - 1}
            disabled={safePage <= 1}
            label="Anterior"
            icon="left"
          />
          <span className="text-[12px] text-hey-fg-2">
            Página <span className="font-semibold text-hey-fg-1">{safePage}</span> de {totalPages}
            <span className="ml-2 text-hey-fg-3">· {total.toLocaleString("es-MX")} usuarios</span>
          </span>
          <PageLink
            page={safePage + 1}
            disabled={safePage >= totalPages}
            label="Siguiente"
            icon="right"
          />
        </nav>
      ) : (
        <div className="pb-12" />
      )}

      <footer className="hey-app-frame flex items-center justify-center gap-2 px-4 pb-8 text-center text-[11px] text-hey-fg-3">
        <HaviRing size={14} />
        <span>HAVI atiende a cada uno con sus propios datos.</span>
      </footer>
    </main>
  );
}

function PageLink({
  page,
  disabled,
  label,
  icon,
}: {
  page: number;
  disabled: boolean;
  label: string;
  icon: "left" | "right";
}) {
  const cls =
    "inline-flex items-center gap-1 rounded-hey-pill border border-hey-divider bg-hey-surface-1 px-4 py-2 text-[13px] font-medium text-hey-fg-1 transition hover:border-hey-blue hover:bg-hey-surface-2";
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`${cls} cursor-not-allowed opacity-40 hover:border-hey-divider hover:bg-hey-surface-1`}
      >
        {icon === "left" ? <ChevronLeft size={16} strokeWidth={2.2} /> : null}
        {label}
        {icon === "right" ? <ChevronRight size={16} strokeWidth={2.2} /> : null}
      </span>
    );
  }
  return (
    <Link href={`/app/personas?page=${page}`} className={cls} prefetch={false}>
      {icon === "left" ? <ChevronLeft size={16} strokeWidth={2.2} /> : null}
      {label}
      {icon === "right" ? <ChevronRight size={16} strokeWidth={2.2} /> : null}
    </Link>
  );
}
