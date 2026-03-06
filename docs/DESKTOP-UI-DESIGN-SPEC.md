# DESKTOP UI DESIGN SPEC (Black/Gold Card System) - FULL MANUAL

**Pages (Desktop only):**
- `/`            Home
- `/games`       Games (Category + Provider + Grid)
- `/promotion`   Promotion Hub (default tab = Promotion)
- `/bonus`       Promotion Hub (default tab = Bonus)  <!-- SAME PAGE UI -->
- `/register`    WhatsApp Register
- `/live-chat`   CS/Admin Live Chat Tool (3 columns)

## HARD CONSTRAINTS
- **Mobile UI:** DO NOT CHANGE
- **Desktop UI style:** match "black background + card + rounded + gold CTA"
- **Bonus == Promotion:** same layout/组件; only default tab differs
- **Games return problem** must be solved (sidebar + breadcrumb + back + exit bar)
- **Live chat list** MUST NOT show: IP / system auto capture text / status open / useless cross button
- **Waiting timer** only runs when: customer has pending message AND agent hasn't replied

## COMPLIANCE NOTE (important for production)
- Add 18+ age gate + responsible policy links in footer + region compliance

---

## 1) DESIGN SYSTEM (Tokens + Layout)

### 1.1 Colors (Desktop black/gold)
| Token   | Hex       | Usage                    |
|---------|-----------|--------------------------|
| bg      | #0E1014   | page background          |
| header  | #14161C   | header bg                 |
| card    | #232630   | surface                   |
| card alt| #1E212A   | input / inner             |
| border  | #3D4150   | subtle                    |
| text    | #E6E9EE   | primary                   |
| text dim| #B8BDC7   | secondary                 |
| gold    | #E8C85A   | primary CTA               |
| gold dim| #C8AC47   | hover/active              |

*Exact hex can be adjusted; keep contrast + consistent.*

### 1.2 Typography
- Base: 16px | H1: 32px (rare) | H2: 24px | H3: 20px | Small: 14px
- Font: one family only (system + fallback or Inter). No mix.

### 1.3 Spacing (8px system)
- 8, 12, 16, 18, 24, 32, 40, 48
- Card padding: 18~22 | Page margin: 24

### 1.4 Radius + Border
- Page main: 22~26px | Cards: 22px | Buttons/Inputs: 16~20px | Border: 2px

### 1.5 Shadow
- Very subtle; no over-glow. Hover: slight lift + border brighten.

### 1.6 Desktop layout grid
- Container max width: 1792 (or 1440) + side padding 24
- 12-col mental grid; consistent vertical rhythm (section spacing 18~24)

### 1.7 Interaction states (required)
- Button: default / hover / active / disabled
- Input: default / focus / error
- Tabs: default / active
- Card: hover → border slightly brighter
- Loading: skeleton placeholders
- Toast: success/error, top-right

---

## 2) GLOBAL DESKTOP SHELL (Header + Footer)

### 2.1 Desktop Header
- **Left:** Logo "KINGDOM888"
- **Middle:** Home | Games | Promo | Bonus | Support
- **Right:** Language pill + Login (gold)

**Routing:** Home→`/`, Games→`/games`, Promo→`/promotion`, Bonus→`/bonus`, Support→`/support` or chat link. Bonus and Promo share same UI component.

### 2.2 Footer
- Links: Responsible Gaming • Security • Privacy
- Compliance: "18+ Only" + policy links

---

## 3) COMPONENT LIBRARY (Desktop)

### 3.1 Atomic UI
Card, Button (primary gold, secondary dark), Input (label, hint, error), Tabs, Badge, Modal, Drawer, Skeleton, EmptyState, Breadcrumb

### 3.2 Complex components
HeroCarousel, QuickActionsRow, CategoryGrid, LiveActivityCard, PromoHubTabs + PromoCardGrid, GamesSidebar + ProviderFilter + GameGrid + GamePlayExitBar, LiveChatLayout (3-col) + ConversationRow + WaitingTimer + UserInfoDrawer

---

## 4) PAGE SPEC: HOME (/)
- A) Hero Carousel
- B) Quick Actions: Register (gold) | Bonus | Deposit | Live Chat
- C) Two-column: Left = Game Categories (3x2) | Right = Live Activity (tabs)
- D) Trust strip: Security / Fast Payout / Responsible
- Category click → `/games?cat=...`; Bonus→`/bonus`; Promo→`/promotion`

---

## 5) PAGE SPEC: GAMES (/games) + RETURN FIX
- **4-layer return:** (1) Left category sidebar always visible (2) Breadcrumb (3) "← Back" top-right (4) Play page with Exit Bar or "Open in new tab"
- Layout: Sidebar (All/Slots/Live/Sports/Fishing/Lottery/New) | Main: Breadcrumb + Back, Provider bar, Game grid (4 cols)
- Play: `/games/play/[gameId]` with Exit Bar; Back preserves query params

---

## 6) PAGE SPEC: PROMOTION HUB (/promotion, /bonus)
- Same UI; `/promotion` defaultTab=Promotion, `/bonus` defaultTab=Bonus
- Tabs: Promotion | Bonus | Rebate | VIP | Events
- 3-column card grid; card: title, highlight, meta, Claim (gold) + View T&C (modal/drawer, collapsible)

---

## 7) PAGE SPEC: WHATSAPP REGISTER (/register)
- Desktop black/gold. Left: Stepper | Right: Why Register
- Steps: 1) WhatsApp Verify (phone, send code, OTP, verify, cooldown) 2) Profile (name, password, referral) 3) Confirm (checkbox + Create)
- Rate limit, cooldown UI, clear copy ("6-digit code to WhatsApp", "Check message requests")

---

## 8) PAGE SPEC: LIVE CHAT (/live-chat)
- 3 columns: Conversations List | Chat Panel + Composer | User Info Drawer
- **List:** NO IP, NO "system auto capture", NO "status open", NO useless cross. Row: customer short, last snippet, **Waiting timer only when** pending_customer_msg_at && !first_reply_at (server timestamp).
- **User Info:** IP only here; phone, tags, last seen, notes. Optional Wait Logs tab.

---

## 9) DATA CONTRACT (summary)
- Home: hero banners, live activity, categories
- Games: categories, providers, games (id, name, provider, thumbUrl, tags, launchUrl)
- PromoHub: campaigns (type, title, highlight, minDeposit, turnover, endAt, termsHtml)
- Register: POST send-code, verify, register (wa_ticket, fullname, password, referral?)
- Live Chat: conversation_id, customer_display, last_message_snippet, pending_customer_msg_at, first_reply_at; user info: phone, ip, tags

---

## 10) SUGGESTED FILE TREE (Desktop)
- `components/ui/`: Card, Button, Input, Tabs, Modal, Drawer, Skeleton, EmptyState, Breadcrumb
- `components/shell/`: DesktopHeader, Footer
- `components/home/`: HeroCarousel, QuickActionsRow, CategoryGrid, LiveActivityCard, TrustStrip
- `components/games/`: GamesCategorySidebar, ProviderFilterBar, GameCard, GameGrid, GamePlayExitBar
- `components/promo/`: PromoHub, PromoTabs, PromoCard, TermsModal
- `components/registerWa/`: WaRegisterStepper, WaPhoneInput, WaOtpBox, WaStatusBanner
- `components/liveChat/`: LiveChatLayout, ConversationList, ConversationRow, WaitingTimer, ChatPanel, UserInfoPanel, WaitLogsTab
- Routes: `page.tsx`, `games/page.tsx`, `games/play/[gameId]/page.tsx`, `promotion/page.tsx`, `bonus/page.tsx`, `register/page.tsx`, `live-chat/page.tsx`

**NOTE:** Mobile pages/components remain unchanged.

---

## 11) ACCEPTANCE CHECKLIST
- [ ] All pages same black/gold style, radius, borders
- [ ] /promotion and /bonus identical; only default tab differs
- [ ] Games: sidebar + breadcrumb + Back + Exit Bar; Back preserves filters
- [ ] Register: cooldown, verify gates profile, clear status messages
- [ ] Live chat: no IP/system/status in list; waiting timer only when pending; server timestamp
