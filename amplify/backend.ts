import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpJwtAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { chatHandler } from "./functions/chat-handler/resource";
import { notificationsHandler } from "./functions/notifications-handler/resource";
import { reportHandler } from "./functions/report-handler/resource";
import { savedChartsHandler } from "./functions/saved-charts-handler/resource";

const backend = defineBackend({
  auth,
  chatHandler,
  notificationsHandler,
  reportHandler,
  savedChartsHandler,
});

// ─── HTTP API + Cognito JWT authorizer + chat route ─────────────────────

const apiStack = backend.createStack("api-stack");

const userPool = backend.auth.resources.userPool;
const userPoolClient = backend.auth.resources.userPoolClient;

const httpApi = new HttpApi(apiStack, "HavicaHttpApi", {
  apiName: "havica-http-api",
  corsPreflight: {
    // Bearer JWT en header Authorization — `*` está bien (no usamos cookies).
    allowOrigins: ["*"],
    allowMethods: [
      CorsHttpMethod.GET,
      CorsHttpMethod.POST,
      CorsHttpMethod.DELETE,
      CorsHttpMethod.OPTIONS,
    ],
    allowHeaders: ["authorization", "content-type"],
    maxAge: undefined,
  },
});

const jwtAuthorizer = new HttpJwtAuthorizer(
  "HavicaJwtAuthorizer",
  `https://cognito-idp.${Stack.of(apiStack).region}.amazonaws.com/${userPool.userPoolId}`,
  {
    jwtAudience: [userPoolClient.userPoolClientId],
  },
);

httpApi.addRoutes({
  path: "/chat",
  methods: [HttpMethod.POST],
  integration: new HttpLambdaIntegration(
    "ChatHandlerIntegration",
    backend.chatHandler.resources.lambda,
  ),
  authorizer: jwtAuthorizer,
});

httpApi.addRoutes({
  path: "/report",
  methods: [HttpMethod.POST],
  integration: new HttpLambdaIntegration(
    "ReportHandlerIntegration",
    backend.reportHandler.resources.lambda,
  ),
  authorizer: jwtAuthorizer,
});

const savedChartsIntegration = new HttpLambdaIntegration(
  "SavedChartsHandlerIntegration",
  backend.savedChartsHandler.resources.lambda,
);

httpApi.addRoutes({
  path: "/save-chart",
  methods: [HttpMethod.POST],
  integration: savedChartsIntegration,
  authorizer: jwtAuthorizer,
});

httpApi.addRoutes({
  path: "/saved-charts",
  methods: [HttpMethod.GET],
  integration: savedChartsIntegration,
  authorizer: jwtAuthorizer,
});

httpApi.addRoutes({
  path: "/saved-charts/{id}",
  methods: [HttpMethod.DELETE],
  integration: savedChartsIntegration,
  authorizer: jwtAuthorizer,
});

const notificationsIntegration = new HttpLambdaIntegration(
  "NotificationsHandlerIntegration",
  backend.notificationsHandler.resources.lambda,
);

httpApi.addRoutes({
  path: "/notifications",
  methods: [HttpMethod.GET],
  integration: notificationsIntegration,
  authorizer: jwtAuthorizer,
});

httpApi.addRoutes({
  path: "/notifications/{id}",
  methods: [HttpMethod.GET],
  integration: notificationsIntegration,
  authorizer: jwtAuthorizer,
});

// ─── IAM: permitir a los Lambdas llamar Bedrock ─────────────────────────

const bedrockPolicy = new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ["bedrock:InvokeModel"],
  resources: [
    // El inference profile (us.*) y los foundation models que despacha.
    `arn:aws:bedrock:*:*:inference-profile/us.anthropic.claude-haiku-4-5-*`,
    `arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-*`,
  ],
});

backend.chatHandler.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.reportHandler.resources.lambda.addToRolePolicy(bedrockPolicy);

// ─── Output: URL del API para que el frontend la lea ────────────────────

backend.addOutput({
  custom: {
    apiUrl: httpApi.apiEndpoint,
  },
});
