// Custom Authenticator theme (D-44). Wraps `<Authenticator>` in `<ThemeProvider colorMode="dark">`.
// `<Authenticator>` v6.15.x does NOT accept a theme prop — must wrap.

import type { Theme } from "@aws-amplify/ui-react";

export const heyAmplifyTheme: Theme = {
  name: "hey-banco",
  tokens: {
    colors: {
      background: {
        primary: { value: "#000000" },
        secondary: { value: "#0E0E0E" },
        tertiary: { value: "#1A1A1A" },
      },
      font: {
        primary: { value: "#FFFFFF" },
        secondary: { value: "rgba(255,255,255,0.60)" },
        tertiary: { value: "rgba(255,255,255,0.40)" },
        interactive: { value: "#3478F6" },
      },
      brand: {
        primary: {
          10: { value: "rgba(52,120,246,0.08)" },
          20: { value: "rgba(52,120,246,0.16)" },
          40: { value: "#5A92F8" },
          60: { value: "#3478F6" },
          80: { value: "#2C6AE0" },
          90: { value: "#245BC2" },
          100: { value: "#1E4FAA" },
        },
      },
      border: {
        primary: { value: "rgba(255,255,255,0.16)" },
        secondary: { value: "rgba(255,255,255,0.24)" },
        focus: { value: "#3478F6" },
      },
    },
    fonts: {
      default: {
        static: { value: "var(--font-plex-sans), system-ui, sans-serif" },
        variable: { value: "var(--font-plex-sans), system-ui, sans-serif" },
      },
    },
    radii: {
      xs: { value: "0.5rem" },
      small: { value: "0.75rem" },
      medium: { value: "1rem" },
      large: { value: "9999px" },
      xl: { value: "9999px" },
    },
    components: {
      authenticator: {
        router: {
          backgroundColor: { value: "#0E0E0E" },
          borderColor: { value: "rgba(255,255,255,0.08)" },
          boxShadow: { value: "none" },
        },
      },
      button: {
        primary: {
          backgroundColor: { value: "#3478F6" },
          color: { value: "#FFFFFF" },
          _hover: { backgroundColor: { value: "#2C6AE0" } },
          _active: { backgroundColor: { value: "#245BC2" } },
        },
      },
      fieldcontrol: {
        borderColor: { value: "rgba(255,255,255,0.16)" },
        color: { value: "#FFFFFF" },
        _focus: { borderColor: { value: "#3478F6" } },
      },
      tabs: {
        item: {
          color: { value: "rgba(255,255,255,0.60)" },
          _active: { color: { value: "#FFFFFF" } },
        },
      },
    },
  },
};
