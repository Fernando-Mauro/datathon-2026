import { defineFunction } from "@aws-amplify/backend";

/**
 * Lambda HAVI notifications handler.
 *
 * GET  /notifications?personaUserId=USR-XXXXX
 *   → lista TODAS las notificaciones del user (pasadas + futuras), ordenadas
 *     por scheduled_at DESC. El frontend agenda toasts para las futuras y
 *     muestra las pasadas como ya disparadas.
 *
 * GET  /notifications/{id}
 *   → notif individual con su havi_context completo (para inyectarlo al chat).
 */
export const notificationsHandler = defineFunction({
  name: "notifications-handler",
  entry: "./handler.ts",
  timeoutSeconds: 15,
  memoryMB: 256,
  environment: {
    DB_HOST: "datathon.cmz4qmgga8b8.us-east-1.rds.amazonaws.com",
    DB_PORT: "3306",
    DB_USER: "havica_app",
    DB_NAME: "datathon",
    DB_SSL: "1",
    DB_PASSWORD: "25yi67EWNpnNDajejgJe1Llh",
  },
});
