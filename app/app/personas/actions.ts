"use server";

import { getFullPersona } from "@/app/_data/personas.server";
import type { Persona } from "@/app/_data/personas";

export async function pickPersonaAction(userId: string): Promise<Persona> {
  if (!userId || typeof userId !== "string") {
    throw new Error("user_id inválido");
  }
  const persona = await getFullPersona(userId);
  if (!persona) {
    throw new Error(`Usuario ${userId} no encontrado`);
  }
  return persona;
}
