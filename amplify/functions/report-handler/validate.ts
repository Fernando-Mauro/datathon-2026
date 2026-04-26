// Validador de SQL para queries generadas por LLM.
//
// Estrategia:
// 1. Limpia comentarios y normaliza espacios.
// 2. Bloquea palabras prohibidas (DML/DDL/funciones de filesystem).
// 3. Bloquea statements múltiples (semicolon en medio del query).
// 4. Exige que arranque con SELECT (después de paréntesis o WITH).
// 5. Inyecta `LIMIT 1000` si el query no tiene LIMIT.
//
// Defensa en profundidad: el user MariaDB es read-only, así que aunque
// alguien escape la regex, el motor de DB rechaza DML.

const FORBIDDEN_KEYWORDS = [
  "INSERT",
  "UPDATE",
  "DELETE",
  "DROP",
  "CREATE",
  "ALTER",
  "TRUNCATE",
  "GRANT",
  "REVOKE",
  "RENAME",
  "REPLACE",
  "LOCK",
  "UNLOCK",
  "CALL",
  "EXEC",
  "EXECUTE",
  "HANDLER",
  "INTO OUTFILE",
  "INTO DUMPFILE",
  "LOAD_FILE",
  "LOAD DATA",
  "BENCHMARK",
  "SLEEP(",
];

// `dual` es la pseudo-tabla virtual de MariaDB para SELECTs sin tabla real
// (ej. `SELECT 1+1 FROM dual`). No tiene datos, no representa riesgo.
const ALLOWED_TABLES = [
  "usuarios",
  "productos",
  "transacciones",
  "comercios",
  "dual",
];

export type ValidationResult =
  | { ok: true; sql: string }
  | { ok: false; reason: string };

export function validateSql(rawSql: string): ValidationResult {
  if (typeof rawSql !== "string" || !rawSql.trim()) {
    return { ok: false, reason: "SQL vacío" };
  }

  // 1. Strip comments — `--` line comments y `/* */` blocks
  let sql = rawSql.replace(/--[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
  // Normalize whitespace
  sql = sql.replace(/\s+/g, " ").trim();

  // Quitar punto y coma final
  sql = sql.replace(/;\s*$/, "");

  // 2. Bloquear semicolons internos (multi-statement)
  if (sql.includes(";")) {
    return { ok: false, reason: "Multi-statement no permitido (`;` interno)" };
  }

  const upper = sql.toUpperCase();

  // 3. Forbidden keywords
  for (const kw of FORBIDDEN_KEYWORDS) {
    // Word boundary para evitar falsos positivos en "INTO_OUTFILE_FAKE"
    const pattern = new RegExp(`\\b${kw.replace(/[(]/g, "\\(")}`, "i");
    if (pattern.test(sql)) {
      return { ok: false, reason: `Palabra prohibida: ${kw}` };
    }
  }

  // 4. Debe iniciar con SELECT o WITH
  if (!upper.startsWith("SELECT") && !upper.startsWith("WITH") && !upper.startsWith("(")) {
    return { ok: false, reason: "El query debe iniciar con SELECT o WITH" };
  }

  // 5. Si hay WITH, extrae nombres de CTEs y agrégalos al allow-list dinámico.
  //    Un CTE puede ser referenciado como tabla en el SELECT principal.
  const cteNames: string[] = [];
  if (upper.startsWith("WITH")) {
    // Match: WITH name AS ( ... ) [, name AS ( ... )]
    // El patrón \w+\s+AS\s*\( también puede aparecer en aliases de subquery
    // (`FROM (SELECT ...) AS alias` no tendría paréntesis después de AS, pero
    // podría confundirse). Para nuestro caso es razonable.
    const cteRe = /\b(\w+)\s+AS\s*\(/gi;
    let m: RegExpExecArray | null;
    while ((m = cteRe.exec(sql)) !== null) {
      const name = m[1]?.toLowerCase();
      if (name) cteNames.push(name);
    }
  }
  const effectiveAllowedTables = [...ALLOWED_TABLES, ...cteNames];

  // 6. Tabla mencionada debe estar en allow-list (incluyendo CTEs)
  const tableMatches = [
    ...sql.matchAll(/\bFROM\s+`?(\w+)`?/gi),
    ...sql.matchAll(/\bJOIN\s+`?(\w+)`?/gi),
  ].map((m) => m[1]?.toLowerCase());

  for (const t of tableMatches) {
    if (t && !effectiveAllowedTables.includes(t)) {
      return { ok: false, reason: `Tabla no permitida: ${t}` };
    }
  }

  // 6. Forzar LIMIT si no existe
  if (!/\bLIMIT\b/i.test(sql)) {
    sql = `${sql} LIMIT 1000`;
  }

  return { ok: true, sql };
}
