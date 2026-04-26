import { defineFunction, secret } from "@aws-amplify/backend";

/**
 * Lambda HAVI saved-charts handler.
 *
 * Maneja persistencia de charts guardados por el admin:
 *   POST   /save-chart           → guarda un snapshot del chart actual
 *   GET    /saved-charts         → lista los charts guardados del admin (filtra por persona si se pasa)
 *   DELETE /saved-charts/{id}    → elimina un guardado
 *
 * Acceso a RDS via user havica_app (SELECT global + INSERT/DELETE en saved_charts).
 * El admin se identifica por el `sub` del JWT de Cognito que API Gateway valida.
 */
export const savedChartsHandler = defineFunction({
  name: "saved-charts-handler",
  entry: "./handler.ts",
  timeoutSeconds: 15,
  memoryMB: 384,
  environment: {
    DB_HOST: "datathon.cmz4qmgga8b8.us-east-1.rds.amazonaws.com",
    DB_PORT: "3306",
    DB_USER: "havica_app",
    DB_NAME: "datathon",
    DB_SSL: "1",
    DB_PASSWORD: secret("DB_PASSWORD_RO"),
  },
});
