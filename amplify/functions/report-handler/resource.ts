import { defineFunction } from "@aws-amplify/backend";

/**
 * Lambda HAVI report handler.
 *
 * Recibe POST /report con { personaUserId, reportType, chartType?, params?, freeformDescription? }.
 *
 * Si `reportType` es uno de los templates conocidos, ejecuta el SQL parametrizado.
 * Si es "freeform", pide a Claude que genere el SQL dado el schema, lo valida
 * (SELECT only, sin DML, force WHERE user_id, LIMIT 1000) y lo ejecuta.
 *
 * Acceso a RDS via user read-only (havica_app, sólo SELECT).
 */
export const reportHandler = defineFunction({
  name: "report-handler",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  memoryMB: 512,
  environment: {
    DB_HOST: "datathon.cmz4qmgga8b8.us-east-1.rds.amazonaws.com",
    DB_PORT: "3306",
    DB_USER: "havica_app",
    DB_NAME: "datathon",
    DB_SSL: "1",
    // Inline temporal — datathon. Rotar el password después del demo y mover a secret().
    DB_PASSWORD: "25yi67EWNpnNDajejgJe1Llh",
    BEDROCK_MODEL_ID: "us.anthropic.claude-haiku-4-5-20251001-v1:0",
    BEDROCK_REGION: "us-east-1",
  },
});
