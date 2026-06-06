# Design Brief

## Direction
WhatsApp-inspired anonymous messaging — dark, minimal, green-accented. Sidebar conversation list paired with main chat panel.

## Tone
Modern minimalist without decoration — every pixel serves messaging clarity and real-time communication.

## Differentiation
Random permanent user ID prominently displayed in header; clean two-column layout with live conversation switching.

## Color Palette

| Token      | OKLCH        | Role                      |
| ---------- | ------------ | ------------------------- |
| background | 0.14 0.01 0  | Page base, dark charcoal  |
| foreground | 0.93 0.01 0  | Primary text, near-white  |
| card       | 0.18 0.012 0 | Message cards, bubbles    |
| primary    | 0.65 0.2 120 | Green accent, CTAs        |
| accent     | 0.65 0.2 120 | Active states, highlights |
| muted      | 0.22 0.015 0 | Secondary text, dividers  |
| sidebar    | 0.16 0.011 0 | Sidebar background        |
| border     | 0.28 0.012 0 | Subtle card separators    |

## Typography

- Display: Space Grotesk — headers, user ID, timestamps
- Body: DM Sans — messages, labels, conversation list
- Scale: hero `text-2xl font-bold`, h2 `text-lg font-semibold`, label `text-xs font-medium uppercase`, body `text-base`

## Elevation & Depth

Three-layer hierarchy: base (background), cards (elevated 4px shadow), active/hover (elevated 12px shadow). Subtle shadows preserve dark aesthetic.

## Structural Zones

| Zone          | Background       | Border               | Notes                                |
| ------------- | ---------------- | -------------------- | ------------------------------------ |
| Header        | sidebar (0.16)   | subtle border-bottom | User ID + optional nick              |
| Sidebar       | sidebar (0.16)   | —                    | Conversation list, alternating cards |
| Chat area     | background (0.14)| —                    | Message history + input at bottom    |
| Message input | card (0.18)      | subtle top border    | Fixed bottom, 1rem padding           |

## Spacing & Rhythm

Compact within cards (0.75rem), generous between sections (1.5rem). Conversation items 0.75rem padding. Messages in groups with 0.5rem gap.

## Component Patterns

- Buttons: subtle green primary `bg-primary text-primary-foreground`, rounded `rounded-md`, hover `opacity-90`
- Cards: dark `bg-card` with `rounded-lg`, `shadow-subtle` on rest, `shadow-card` on hover
- Badges: `bg-muted text-muted-foreground`, uppercase label style
- Message bubbles: `bg-card`, right-aligned for sent, left for received

## Motion

- Entrance: fade-in `duration-200` on page load
- Hover: background shift + shadow elevation on cards, opacity on buttons
- Decorative: none — messaging clarity is priority

## Constraints

- No online/offline status indicators (by design)
- No read receipts or typing indicators
- No message deletion UI
- No user search or discovery features
- No conversation archiving controls

## Signature Detail

Random permanent user ID displayed prominently in header (e.g., "User #847392") — identity without login, memorable and scannable.
