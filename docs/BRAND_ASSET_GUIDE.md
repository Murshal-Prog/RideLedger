# RideLedger — Brand Asset Guide

## 1. Brand Identity Overview

**RideLedger** is the financial cockpit for Rapido Captains. The brand identity combines the velocity of daily rides with financial clarity and growth.

The visual identity is defined by:
- An aerodynamic speedometer gauge ("R") symbolizing speed, mileage, and active online sessions.
- An upward trending green/teal arrow and Indian Rupee symbol ("₹") symbolizing income growth and profit.
- A solid slate anchor ("L") representing ledger stability, accounting accuracy, and reliability.

---

## 2. Official Color Palette

### Primary Brand Colors
- **Brand Teal / Mint**: `#00D2B4` (Tailwind token: `primary`)
  - Primary interactive buttons, key brand highlights, active navigation indicators, and speedometer curves.
  - Hover / Darkened: `#00B59B`
  - Subtle Tint / Glow: `rgba(0, 210, 180, 0.15)`
- **Ledger Slate**: `#1F2937` / `#0F172A` (Tailwind token: `foreground` / `card`)
  - Typography in light theme, structural borders, card backgrounds in dark theme.

### Captain Accent Color (Rapido Ecosystem Alignment)
- **Captain Amber / Rapido Yellow**: `#F59E0B` (Accent token: `accent-amber`)
  - Accent badges, quick "Go Online" action highlights, fuel expense tags, and vehicle indicators.
  - Light mode contrast compliant text: `#B45309`

### Semantic Financial Colors
- **Income & Profit (Emerald)**: `#10B981`
  - Gross earnings, net profit, online status pulse, positive indicators.
- **Expenses & Deficit (Rose/Ruby)**: `#EF4444`
  - Fuel, maintenance, tolls, error messages, offline indicators.
- **Incentives & Tips (Amber/Gold)**: `#F59E0B`
  - Separate platform incentives and rider tips.
- **UPI / Digital Payment (Indigo/Teal)**: `#6366F1`
  - UPI payment method badge.
- **Cash Payment (Emerald)**: `#10B981`
  - Cash payment method badge.

---

## 3. Logo Asset Usage Matrix

The authoritative source files are stored in `Assets/` and mirrored in `public/brand/` for client rendering:

| Asset File | Format & Size | Background | Approved Use Cases | Prohibited Uses |
|---|---|---|---|---|
| `RideLedger_Logo_v5.png` | 1391 x 1023 RGBA | Transparent | **Primary App Logo**: Top navbar, desktop sidebar header, login/auth screens across both Light and Dark themes. | Do not place on low-contrast teal backgrounds without proper contrast padding. |
| `RideLedger_Logo_v4.png` | 965 x 655 RGBA | Transparent | **Compact Monogram**: Mobile header, collapsed desktop sidebar icon, favicon, PWA app shortcut icon, avatar badge. | Do not use where full brand name is required without adjacent text. |
| `RideLedger_Logo_v2.png` | 1391 x 1023 RGBA | Solid White | **Light Canvas / Print**: White header containers, light-theme PDF/XLSX export covers, printed receipts. | Do not use on dark mode backgrounds (creates white rectangular bounding box). |
| `RideLedger_Logo_v3.png` | 965 x 655 RGBA | Solid White | **Square White Badge**: App store listing icon, light theme avatar badge, external documentation cards. | Do not use on dark theme headers. |
| `RideLedger_Logo_v1 (1).png` | 2752 x 1536 RGBA | White Canvas | **Hero Banner**: Splash screens, desktop welcome cards, marketing documentation banners. | Do not use as small inline icon. |

---

## 4. Typography

- **Primary Typeface**: `Inter`, system UI font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Monospace Typeface for Numbers**: `JetBrains Mono`, `ui-monospace`, `monospace` for odometer readings, timestamps, and rupee amounts to ensure tabular numerical alignment.

---

## 5. Spacing and Touch Target Standards

- **Touch Targets**: Minimum `44px x 44px` on mobile for all buttons, bottom navigation tabs, and inputs.
- **Border Radius**: `rounded-xl` (`12px`) for cards and modals; `rounded-lg` (`8px`) for buttons and inputs; `rounded-full` for badges and status indicators.
- **Mobile Edge Padding**: Minimum `16px` (`px-4`) horizontal padding to prevent edge clipping.
