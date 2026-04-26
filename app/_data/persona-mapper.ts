// Mapper: identidad ligera de una fila de `usuarios` para el picker.
// El dataset es anónimo (no hay columna nombre) — usamos el `user_id`
// como display name y derivamos sólo el color del avatar desde el id.
// El headline se arma con datos reales: ocupación · edad · ciudad/estado.
//
// Los datos financieros viven en `persona-finance.server.ts` y se cargan
// con queries reales a productos + transacciones + comercios.

export type UserRow = {
  user_id: string;
  edad: number;
  genero: "M" | "H" | "SE";
  estado: string | null;
  ciudad: string | null;
  ocupacion:
    | "Empleado"
    | "Independiente"
    | "Estudiante"
    | "Empresario"
    | "Desempleado"
    | "Jubilado";
};

const AVATAR_VARS = [
  "--color-hey-accent-magenta",
  "--color-hey-accent-cyan",
  "--color-hey-accent-sky",
  "--color-hey-accent-purple",
  "--color-hey-accent-amber",
  "--color-hey-accent-green",
];

// FNV-1a 32-bit — determinístico, sin deps.
function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function avatarFromUserId(userId: string): string {
  const h = hash32(`avatar:${userId}`);
  return AVATAR_VARS[h % AVATAR_VARS.length]!;
}

function buildHeadline(row: UserRow): string {
  const lugar = row.ciudad ?? row.estado ?? "México";
  return `${row.ocupacion} · ${row.edad} años · ${lugar}`;
}

/** Identidad derivada — el shape ligero que el picker necesita. */
export type PersonaListItem = {
  id: string;
  firstName: string;
  fullName: string;
  headline: string;
  avatarVar: string;
};

export function rowToListItem(row: UserRow): PersonaListItem {
  return {
    id: row.user_id,
    firstName: row.user_id,
    fullName: row.user_id,
    headline: buildHeadline(row),
    avatarVar: avatarFromUserId(row.user_id),
  };
}

