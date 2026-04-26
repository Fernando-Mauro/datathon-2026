// 6 templates de reporte canónicos. Cada uno emite SQL parametrizado con
// placeholders `?` para mysql2. Todos filtran por user_id como primer parámetro.

export type ChartType =
  | "bar"
  | "horizontal_bar"
  | "line"
  | "pie"
  | "radial_bar";

export type ReportTemplate = {
  id: string;
  title: string;
  description: string;
  defaultChartType: ChartType;
  build: (userId: string) => { sql: string; params: unknown[]; xKey: string; yKey: string; series?: string };
};

const SPENDING_TIPOS = "'compra','pago_servicio','cargo_recurrente'";
const INCOME_TIPOS =
  "'transf_entrada','deposito_oxxo','deposito_farmacia','retiro_inversion','cashback','devolucion'";

// Anchor "ahora" del demo = última fecha registrada en transacciones.
const NOW_ANCHOR = "(SELECT MAX(fecha_hora) FROM transacciones)";

const MCC_TO_DISPLAY: Record<string, string> = {
  supermercado: "Supermercado",
  restaurante: "Restaurantes",
  delivery: "Delivery",
  entretenimiento: "Entretenimiento",
  transporte: "Transporte",
  servicios_digitales: "Servicios digitales",
  salud: "Salud",
  educacion: "Educación",
  ropa_accesorios: "Ropa",
  tecnologia: "Tecnología",
  viajes: "Viajes",
  gobierno: "Gobierno",
  hogar: "Hogar",
  transferencia: "Transferencia",
  retiro_cajero: "Retiro",
};

const PRODUCT_TO_DISPLAY: Record<string, string> = {
  cuenta_debito: "Cuenta débito",
  cuenta_negocios: "Cuenta negocios",
  inversion_hey: "Inversión",
  tarjeta_credito_hey: "Tarjeta crédito",
  tarjeta_credito_garantizada: "Tarjeta crédito garantizada",
  tarjeta_credito_negocios: "Tarjeta crédito negocios",
  credito_personal: "Crédito personal",
  credito_auto: "Crédito auto",
  credito_nomina: "Crédito nómina",
  seguro_vida: "Seguro de vida",
  seguro_compras: "Seguro compras",
};

const DAY_OF_WEEK = ["", "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const TEMPLATES: Record<string, ReportTemplate> = {
  spending_by_category: {
    id: "spending_by_category",
    title: "Gasto por categoría — últimos 30 días",
    description: "Cuánto se gastó en cada categoría en los últimos 30 días.",
    defaultChartType: "bar",
    build: (userId) => ({
      sql: `
        SELECT c.categoria_mcc AS category_key, ROUND(SUM(t.monto), 2) AS total
        FROM transacciones t
        JOIN comercios c ON c.comercio_id = t.comercio_id
        WHERE t.user_id = ?
          AND t.estatus = 'completada'
          AND t.tipo_operacion IN (${SPENDING_TIPOS})
          AND t.fecha_hora >= DATE_SUB(${NOW_ANCHOR}, INTERVAL 30 DAY)
        GROUP BY c.categoria_mcc
        ORDER BY total DESC
        LIMIT 14
      `,
      params: [userId],
      xKey: "category",
      yKey: "total",
    }),
  },

  monthly_trend: {
    id: "monthly_trend",
    title: "Tendencia mensual de gasto — últimos 6 meses",
    description: "Suma de gastos por mes durante los últimos 6 meses.",
    defaultChartType: "line",
    build: (userId) => ({
      sql: `
        SELECT DATE_FORMAT(fecha_hora, '%Y-%m') AS month, ROUND(SUM(monto), 2) AS total
        FROM transacciones
        WHERE user_id = ?
          AND estatus = 'completada'
          AND tipo_operacion IN (${SPENDING_TIPOS})
          AND fecha_hora >= DATE_SUB(${NOW_ANCHOR}, INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(fecha_hora, '%Y-%m')
        ORDER BY month ASC
      `,
      params: [userId],
      xKey: "month",
      yKey: "total",
    }),
  },

  top_merchants: {
    id: "top_merchants",
    title: "Top 10 comercios — últimos 90 días",
    description: "Los 10 comercios donde más se gastó en los últimos 90 días.",
    defaultChartType: "horizontal_bar",
    build: (userId) => ({
      sql: `
        SELECT c.nombre AS merchant, ROUND(SUM(t.monto), 2) AS total
        FROM transacciones t
        JOIN comercios c ON c.comercio_id = t.comercio_id
        WHERE t.user_id = ?
          AND t.estatus = 'completada'
          AND t.tipo_operacion IN (${SPENDING_TIPOS})
          AND t.fecha_hora >= DATE_SUB(${NOW_ANCHOR}, INTERVAL 90 DAY)
        GROUP BY c.nombre
        ORDER BY total DESC
        LIMIT 10
      `,
      params: [userId],
      xKey: "merchant",
      yKey: "total",
    }),
  },

  income_vs_spending: {
    id: "income_vs_spending",
    title: "Ingreso vs gasto por mes — últimos 6 meses",
    description: "Compara entradas vs salidas de dinero por mes.",
    defaultChartType: "bar",
    build: (userId) => ({
      sql: `
        SELECT
          DATE_FORMAT(fecha_hora, '%Y-%m') AS month,
          ROUND(SUM(CASE WHEN tipo_operacion IN (${INCOME_TIPOS}) THEN monto ELSE 0 END), 2) AS ingreso,
          ROUND(SUM(CASE WHEN tipo_operacion IN (${SPENDING_TIPOS}) THEN monto ELSE 0 END), 2) AS gasto
        FROM transacciones
        WHERE user_id = ?
          AND estatus = 'completada'
          AND fecha_hora >= DATE_SUB(${NOW_ANCHOR}, INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(fecha_hora, '%Y-%m')
        ORDER BY month ASC
      `,
      params: [userId],
      xKey: "month",
      yKey: "ingreso", // primary; frontend multi-series renders both
      series: "ingreso,gasto",
    }),
  },

  spending_by_weekday: {
    id: "spending_by_weekday",
    title: "Gasto por día de la semana — últimos 90 días",
    description: "Distribución de gasto por día de la semana.",
    defaultChartType: "bar",
    build: (userId) => ({
      sql: `
        SELECT
          DAYOFWEEK(fecha_hora) AS day_num,
          ROUND(SUM(monto), 2) AS total
        FROM transacciones
        WHERE user_id = ?
          AND estatus = 'completada'
          AND tipo_operacion IN (${SPENDING_TIPOS})
          AND fecha_hora >= DATE_SUB(${NOW_ANCHOR}, INTERVAL 90 DAY)
        GROUP BY DAYOFWEEK(fecha_hora)
        ORDER BY day_num ASC
      `,
      params: [userId],
      xKey: "day",
      yKey: "total",
    }),
  },

  balance_by_product: {
    id: "balance_by_product",
    title: "Saldo por producto",
    description: "Cuánto saldo hay en cada producto activo.",
    defaultChartType: "pie",
    build: (userId) => ({
      sql: `
        SELECT
          tipo_producto AS product_key,
          ROUND(SUM(saldo_actual), 2) AS total
        FROM productos
        WHERE user_id = ?
          AND estatus = 'activo'
          AND saldo_actual IS NOT NULL
        GROUP BY tipo_producto
        ORDER BY total DESC
      `,
      params: [userId],
      xKey: "product",
      yKey: "total",
    }),
  },
};

/**
 * Postprocesa filas para humanizar campos que vienen como enums/códigos:
 * categoria_mcc → "Restaurantes", tipo_producto → "Cuenta débito",
 * day_num → "Lunes". El frontend renderiza tal cual lo que llega.
 */
export function humanizeRows(
  reportType: string,
  rows: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  if (reportType === "spending_by_category") {
    return rows.map((r) => ({
      category: MCC_TO_DISPLAY[String(r.category_key)] ?? String(r.category_key),
      total: Number(r.total),
    }));
  }
  if (reportType === "balance_by_product") {
    return rows.map((r) => ({
      product: PRODUCT_TO_DISPLAY[String(r.product_key)] ?? String(r.product_key),
      total: Number(r.total),
    }));
  }
  if (reportType === "spending_by_weekday") {
    return rows.map((r) => ({
      day: DAY_OF_WEEK[Number(r.day_num)] ?? String(r.day_num),
      total: Number(r.total),
    }));
  }
  // Para los demás los campos ya son humanos (month, merchant, etc.)
  return rows.map((r) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) {
      out[k] = typeof v === "string" ? v : Number(v);
    }
    return out;
  });
}
