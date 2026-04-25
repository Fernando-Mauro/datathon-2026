import { defineAuth } from "@aws-amplify/backend";

/**
 * Phase 2 — first backend resource on top of the Phase 1 skeleton.
 * Cognito User Pool with email + password sign-in, mandatory email verification,
 * and email-based password reset. Default password policy (min 8, upper+lower+digit+symbol).
 *
 * Attribute name note: the CDK property `fullname` maps to the Cognito/OIDC standard
 * claim `"name"`. The <Authenticator> picks this up via Zero Configuration from
 * amplify_outputs.json and auto-renders a "Name" field in the sign-up form.
 *
 * @see https://docs.amplify.aws/react/build-a-backend/auth/
 */
export const auth = defineAuth({
  loginWith: { email: true },
  userAttributes: {
    email: { required: true, mutable: false },
    fullname: { required: true, mutable: true },
  },
  accountRecovery: "EMAIL_ONLY",
});
