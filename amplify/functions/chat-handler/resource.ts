import { defineFunction } from "@aws-amplify/backend";

/**
 * Lambda HAVI chat handler.
 *
 * Recibe POST /chat con { personaUserId, messages[] } y devuelve la respuesta
 * de Claude (Bedrock). Enriquece el prompt con contexto demográfico/financiero
 * del user activo (RDS read-only).
 *
 * Vive fuera de VPC — la RDS es pública. DB_PASSWORD viene de un secret
 * (`npx ampx sandbox secret set DB_PASSWORD_RO`).
 */
export const chatHandler = defineFunction({
  name: "chat-handler",
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
