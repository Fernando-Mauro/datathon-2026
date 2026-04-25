# hey, — Mobile UI Kit

A high-fidelity recreation of the hey banco mobile app. Click-thru prototype with real React state.

## Screens

| File | Description |
|---|---|
| `index.html` | Interactive entry point — phone frame with all screens wired together |
| `HomeScreen.jsx` | Dashboard ("hey, Fernando") — promo banner, contracted products, available products, tab bar |
| `HaviScreen.jsx` | HAVI chat — system greeting, send a message, get a reply |
| `ProductDetailScreen.jsx` | Generic product detail (works for credit card, personal loan, auto, kids account, etc.) |
| `TransferScreen.jsx` | Transfer flow — search, quick actions, frequent contacts |
| `InboxScreen.jsx` | Buzón — message list with unread indicators |
| `Primitives.jsx` | Shared building blocks: `HeyHeader`, `PromoBanner`, `IconChip`, `ListRow`, `TabBar`, `HaviRing`, `PrimaryButton`, `Icon` |
| `ios-frame.jsx` | Device shell (starter component) |

## How to use

Open `index.html` directly. Tap any product on the home screen, tap HAVI in the bottom nav for the chat, or switch tabs. Type into HAVI to see a fake reply.

## Notes & caveats

- Screens reproduce the visuals in the reference screenshot (home + HAVI). Other screens (Pagos, Transferir, Buzón) are **plausible extrapolations** — the user did not provide reference images for them, so they should be reviewed against real product before use.
- Icons are stroke-only SVGs matching the original silhouette/color treatment but are **not the actual product icons** — please share the real set.
- Fonts use Inter (substitute for the brand sans). Wordmark uses Inter Black.
