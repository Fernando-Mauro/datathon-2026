"use client"; // Runs Amplify.configure at module-load + provides Authenticator Context for hooks called outside <Authenticator>.

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";

// Default browser storage (localStorage) — no `ssr: true`. The `ssr` flag is for
// Amplify Gen2 setups that ALSO need server-side auth in route handlers / server
// actions, which requires `@aws-amplify/adapter-nextjs` (deferred to Phase 4 if
// ever needed). For purely client-side `<Authenticator>`, `ssr: true` causes the
// cookie storage adapter to hang server-side without the adapter installed,
// leaving `useAuthenticator` stuck on `authStatus === "configuring"`. This walks
// back RESEARCH L-3 — the original CONTEXT D-28 (localStorage) was correct.
// AUTH-05 (refresh persistence) is satisfied: localStorage survives page reload.
Amplify.configure(outputs);

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  // Authenticator.Provider is required so useAuthenticator() can be called
  // from app/login/page.tsx (sibling of <Authenticator>, not a descendant
  // of its render-prop). See RESEARCH L-4.
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}
