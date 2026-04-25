"use client"; // Runs Amplify.configure at module-load + provides Authenticator Context for hooks called outside <Authenticator>.

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";

// `ssr: true` is REQUIRED for Next.js per official docs — switches token storage
// to cookies so the session survives refresh. SUPERSEDES CONTEXT D-28 wording
// (which assumed localStorage). See node_modules/next/dist/docs and
// https://docs.amplify.aws/nextjs/build-a-backend/server-side-rendering/
Amplify.configure(outputs, { ssr: true });

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  // Authenticator.Provider is required so useAuthenticator() can be called
  // from app/login/page.tsx (sibling of <Authenticator>, not a descendant
  // of its render-prop). See RESEARCH L-4.
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}
