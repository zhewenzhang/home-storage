# Swiss International Typographic Style Redesign — Remaining Pages

Apply Swiss Design System (already defined in tailwind.config.js and index.css) to ALL remaining pages by replacing old classes with Swiss equivalents.

## Design System Reference

- **Colors**: `bg-black`, `text-black`, `bg-white`, `text-white`, `bg-swiss-red`, `text-swiss-red`, `border-swiss-red`, `bg-swiss-red/5`, `bg-swiss-red/10`
- **Borders**: `border-2 border-black dark:border-white`, never rounded corners
- **Cards**: `swiss-card` (defined in index.css as border-2 + padding, no rounded, no shadow)
- **Buttons**: `swiss-btn` (black bg, white text, uppercase, thick border, no rounded) or `swiss-btn-outline`
- **Inputs**: `swiss-input` (thick border, no rounded)
- **Animation**: `swiss-enter` (not `animate-enter`)
- **Typography**: Uppercase, font-black or font-bold, tracking-wide/wider/widest, Inter font
- **Section labels**: `swiss-section-label` (red, tiny uppercase)
- **Icons**: Keep lucide-react icons, just color them with text colors
- **No**: `rounded-*`, `shadow-*`, `bg-gradient-*`, `card`, `btn-primary`, `btn-secondary`, `btn-outline`, `input-field`, `animate-enter`, `framer-motion`, `backdrop-blur`, `rounded-full`, `ring-*`, CSS variables

---

## File 1: src/pages/Items.tsx

Current: Uses `card`, `btn-primary`, `rounded-2xl`, `rounded-full`, `shadow-md`, `bg-primary`, `animate-enter`, colored badges, gradient backgrounds.

Replace ALL of the following:
1. `"card text-center py-16"` → `"swiss-card text-center py-16"`
2. `"btn-primary"` → `"swiss-btn"`
3. All `rounded-2xl` → remove
4. All `rounded-xl` → remove
5. All `rounded-full` → remove
6. All `shadow-md` → remove
7. `animate-enter` → `swiss-enter`
8. `bg-primary dark:bg-blue-600 text-white border-transparent shadow-md` → `bg-black dark:bg-white text-white dark:text-black font-bold`
9. `bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600` → `bg-transparent text-gray-500 dark:text-gray-400 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black`
10. `bg-gray-50/80 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-900 border border-transparent dark:border-slate-800` → `border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900`
11. `w-10 h-10 rounded-xl border` → `w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-black`
12. `rounded-full text-[10px] font-bold ${l.color}` → `text-[10px] font-bold border-2 border-black dark:border-white px-2 py-0.5`
13. `w-3 h-3 rounded-full` → `w-3 h-3`
14. `bg-red-100 text-red-600` → remove color classes and just do `text-swiss-red`
15. `bg-yellow-100 text-yellow-700` → `text-black dark:text-white`
16. `bg-green-50 text-green-600` → `text-gray-500 dark:text-gray-400`
17. `text-2xl font-bold dark:text-gray-100` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white`
18. `text-sm text-gray-500 dark:text-gray-400 mt-1` → `text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1`
19. The "全部" and category filter buttons: use the Swiss toggle style with black borders
20. `rounded-2xl bg-gray-50/80` → remove rounded, keep bg and border
21. Locations header: replace `rounded-full bg-primary` with a square `bg-black dark:bg-white`

Rewrite Items.tsx completely with these rules applied.

---

## File 2: src/pages/ItemForm.tsx

Current: Uses `card`, `input-field`, `btn-primary`, `rounded-2xl`, `rounded-xl`, `rounded-full`, `shadow-md`, `bg-primary`, `animate-enter`, gradients.

Replace:
1. All `card` → `swiss-card`
2. All `input-field` → `swiss-input`
3. All `btn-primary` → `swiss-btn`
4. `animate-enter` → `swiss-enter`
5. Remove ALL `rounded-2xl`, `rounded-xl`, `rounded-lg`, `rounded-full`
6. Remove ALL `shadow-*`, `shadow-sm`, `shadow-md`, `shadow-lg`
7. `bg-primary dark:bg-blue-600 text-white border-transparent shadow-md` → `bg-black dark:bg-white text-white dark:text-black font-bold border-2 border-black dark:border-white`
8. `bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600` → `bg-transparent text-gray-600 dark:text-gray-400 border-2 border-black dark:border-white`
9. `bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600` quantity buttons → `border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black`
10. `w-12 h-12 rounded-2xl bg-gray-100` → `w-12 h-12 border-2 border-black dark:border-white`
11. Back button: replace `rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 shadow-sm` → `border-2 border-black dark:border-white p-2`
12. `w-10 h-10 rounded-2xl` → `w-10 h-10 border-2 border-black dark:border-white`
13. Delete button: replace `rounded-2xl bg-red-50` → `border-2 border-swiss-red`
14. `text-2xl font-bold` → `text-2xl font-black uppercase tracking-wider`
15. `text-sm font-bold text-gray-600 dark:text-gray-300 mb-3` → `text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3`
16. Image upload area: `rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed` → keep border-2 border-dashed but remove rounded-2xl
17. `rounded-full` → remove (make X button rectangular)
18. `bg-black/60 backdrop-blur-md rounded-full` AI button → `bg-black border-2 border-white`
19. `rounded-2xl shadow-sm` → remove
20. AI section heading: `text-sm font-bold text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-2` → `text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2`
21. Location empty state: `rounded-2xl border` → remove rounded
22. Expiry quick buttons: replace with border-2 border-black dark:border-white style, uppercase

---

## File 3: src/pages/Locations.tsx

Current: Uses `card`, `btn-primary`, `rounded-2xl`, `rounded-xl`, `rounded-full`, `shadow-2xl`, `bg-[#EAF4F8]`, `animate-enter`, colored gradients.

Replace:
1. All `card` → `swiss-card`
2. All `btn-primary` → `swiss-btn`
3. `animate-enter` → `swiss-enter`
4. Remove ALL `rounded-2xl`, `rounded-xl`, `rounded-lg`, `rounded-full`
5. Remove ALL `shadow-*`, `shadow-sm`, `shadow-2xl`
6. `rounded-3xl shadow-2xl p-8 max-w-md border` → remove rounded, shadow, keep border and padding
7. `rounded-xl bg-white dark:bg-slate-800 border` → `border-2 border-black dark:border-white`
8. The type picker grid: replace colored active state `bg-[#EAF4F8] border-[#3B6D8C] text-[#3B6D8C] dark:... shadow-md` → `bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white`
9. Inactive state: `bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400` → `bg-transparent border-2 border-black dark:border-white text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white`
10. `text-2xl font-bold dark:text-gray-100` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white`
11. `text-sm text-gray-500 dark:text-gray-400 mt-1` → `text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1`
12. `rounded-full bg-gray-50` center icon → `w-20 h-20 border-4 border-black dark:border-white flex items-center justify-center`
13. `w-12 h-12 rounded-2xl bg-[#EAF4F8]` → `w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center`
14. All `bg-gray-50/80 dark:bg-slate-900/50 rounded-2xl border border-transparent` → `border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900`
15. Toggle buttons (expand/collapse): `rounded-lg hover:bg-gray-100` → `border-2 border-black dark:border-white hover:bg-black hover:text-white`
16. Location edit/delete buttons: replace with border-2 style
17. `rounded-xl bg-gray-50 dark:bg-slate-900/50 hover:bg-[#EAF4F8]` type picker items → `border-2 border-black dark:border-white hover:bg-black hover:text-white`
18. `text-2xl font-mono font-bold tracking-widest text-gray-800` → `font-black tracking-widest (keep mono though)`
19. `text-lg font-bold text-gray-900` → `text-lg font-black text-black dark:text-white`
20. Header title: `text-xl font-bold flex items-center gap-2 text-[#2A4D63] dark:text-blue-400` → `text-xl font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2`

---

## File 4: src/pages/FloorPlan.tsx

Current: Uses `card`, `btn-primary`, `rounded-2xl`, `rounded-xl`, `rounded-full`, `shadow-lg`, `shadow-2xl`, `bg-gradient-to-r`, colored fills, `animate-enter`.

Replace:
1. All `card` → `swiss-card`
2. All `btn-primary` → `swiss-btn`
3. `animate-enter` → `swiss-enter`
4. Remove ALL `rounded-2xl`, `rounded-xl`, `rounded-lg`
5. Remove ALL `shadow-*`, `shadow-lg`, `shadow-2xl`, `shadow-md`
6. All `rounded-full` → remove (make circular elements squared up, like the resize handles)
7. `bg-gradient-to-r from-gray-100 to-transparent` → `bg-gray-100 dark:bg-gray-900`
8. `rounded-2xl overflow-hidden` → remove rounded
9. Tool buttons: `rounded-xl font-bold transition-all bg-primary dark:bg-blue-600 text-white shadow-lg` → `border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold`
10. Tool inactive state: `bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200` → `bg-transparent border-2 border-black dark:border-white text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white`
11. Room picker dropdown: `rounded-2xl shadow-2xl border border-gray-100` → `border-2 border-black dark:border-white bg-white dark:bg-black`
12. `rounded-xl bg-gray-50 hover:bg-[#EAF4F8]` → `border-2 border-black dark:border-white hover:bg-swiss-red hover:text-white hover:border-swiss-red`
13. `text-2xl font-bold` headings → `text-2xl font-black uppercase tracking-wider text-black dark:text-white`
14. `text-sm text-gray-500 mt-1` → `text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1`
15. `rounded-xl bg-red-50` delete button → `border-2 border-swiss-red hover:bg-swiss-red hover:text-white`
16. `bg-blue-600 rounded-full` resize handle → `bg-black w-6 h-6 flex items-center justify-center`
17. `bg-blue-500 rounded-full` resize handles → `bg-black w-5 h-5`
18. `rounded-full bg-gray-800 text-white shadow-lg` tooltip → make it a rectangular badge with black bg
19. Selected info panel: `card border-l-4 border-[#3B6D8C]` → `swiss-card` (and instead of colored left border, use `border-2 border-swiss-red`)
20. `w-12 h-12 rounded-2xl bg-[#EAF4F8]` → `w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center`
21. `rounded-xl bg-gray-50` in the info panel → `swiss-btn-outline` or border style
22. Room type colors in ROOM_TYPES: change fill colors to just use white/black, keep icon but make walls black/white
23. Cabinet colors: change to black default
24. `rounded-full` for cabinet dots → keep as circles (they're SVG-style dots), but update the color to black
25. The "scrim" gradient indicators for mobile scroll → remove entirely
26. Keep the SVG floor plan functional but ensure text is uppercase where appropriate

---

## File 5: src/pages/BatchManage.tsx

Current: Uses `btn-outline`, `rounded-2xl`, `rounded-xl`, `rounded-lg`, `rounded-md`, `shadow-sm`, `bg-primary`, `animate-enter`, gradients, colored icons.

Replace:
1. `rounded-2xl` → remove throughout
2. `rounded-xl` → remove throughout
3. `rounded-lg` → remove throughout
4. `rounded-md` → remove throughout
5. `shadow-sm` → remove throughout
6. `shadow-md` → remove throughout
7. `animate-enter` → `swiss-enter`
8. `bg-primary hover:bg-primary-dark dark:bg-blue-600 dark:hover:bg-blue-700` → `bg-black dark:bg-white text-white dark:text-black hover:bg-swiss-red hover:border-swiss-red border-2 border-black dark:border-white font-bold uppercase`
9. `bg-blue-50/50 dark:bg-blue-900/30 rounded-lg border border-blue-100/50` selected toolbar → `border-2 border-black dark:border-white bg-swiss-red/5 p-2`
10. `text-blue-800 dark:text-blue-300` → `text-black dark:text-white`
11. `btn-outline px-3 py-1.5 text-sm font-medium text-gray-700 border` → `border-2 border-black dark:border-white px-3 py-1.5 text-sm font-bold uppercase text-gray-700 dark:text-gray-400 hover:bg-black hover:text-white`
12. `bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100` table container → `border-2 border-black dark:border-white`
13. `bg-gray-50 dark:bg-slate-900/80 border-b border-gray-100` table head → `border-b-2 border-black dark:border-white bg-gray-100 dark:bg-gray-900`
14. `text-sm font-semibold text-gray-500 dark:text-gray-400` → `text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400`
15. `bg-transparent border-0 focus:ring-2 focus:ring-primary/30 rounded-md` inputs → `bg-transparent border-0 focus:border-black dark:focus:border-white border-b-2`
16. `bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 rounded-lg` selects → `border-2 border-black dark:border-white bg-transparent`
17. `bg-green-50 dark:bg-green-900/30 border border-green-100 text-green-700` status badges → `border-2 border-black dark:border-white font-bold uppercase text-[10px] px-2 py-0.5`
18. `bg-blue-50 dark:bg-blue-900/30 border border-blue-100 text-primary` status badges → same Swiss style
19. `h1.text-2xl.font-bold.flex.items-center.gap-2.text-primary-dark` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2`
20. `text-sm.text-gray-500.dark:text-gray-400.mt-1` → `text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1`
21. Header DB icon: remove color, use black/white
22. Batch edit modal: `rounded-2xl shadow-xl border border-transparent` → `border-2 border-black dark:border-white bg-white dark:bg-black`
23. `rounded-full` close button → rectangular `border-2 border-black dark:border-white p-2`
24. `bg-primary/5 dark:bg-blue-900/20` selected row → `bg-swiss-red/5`
25. `text-primary dark:text-blue-500` checkbox → plain black/white
26. `bg-gray-50 dark:bg-slate-900` thead row → `bg-gray-100 dark:bg-gray-900 border-b-2 border-black dark:border-white`
27. `text-primary-dark dark:text-blue-400` heading → `text-black dark:text-white`
28. `bg-primary/10 dark:bg-blue-900/30 text-primary` —> `bg-black text-white dark:bg-white dark:text-black`
29. Modal cancel button: replace with `swiss-btn-outline`
30. Modal confirm button: replace with `swiss-btn`

---

## File 6: src/pages/Settings.tsx

Current: Uses `card`, `btn-outline`, `rounded-xl`, `rounded-full`, `rounded-3xl`, `shadow-sm`, `bg-gradient-to-br`, `bg-primary`, `animate-enter`, fancy gradients, colored icons, `rounded-full` avatars.

Replace:
1. All `card` → `swiss-card`
2. `animate-enter` → `swiss-enter`
3. `btn-outline` → `swiss-btn-outline`
4. Remove ALL `rounded-xl`, `rounded-2xl`, `rounded-3xl`
5. Remove ALL `rounded-full` (make avatars square with border)
6. Remove ALL `shadow-*`, `shadow-sm`, `shadow-2xl`
7. Remove ALL `bg-gradient-*` → use solid colors
8. `bg-gradient-to-br from-white to-blue-50/30` account card → `bg-white dark:bg-black border-2 border-black dark:border-white`
9. `h1.text-2xl.font-bold.flex.items-center.gap-2.text-primary-dark` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white`
10. `w-16 h-16 rounded-full bg-blue-100` avatar → `w-16 h-16 border-2 border-black dark:border-white flex items-center justify-center bg-white dark:bg-black`
11. `text-lg font-bold text-gray-900 dark:text-gray-100 truncate` → `text-lg font-black uppercase text-black dark:text-white`
12. `btn-outline.px-4.py-2.text-sm.text-red-500.border-red-200` → `border-2 border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white font-bold uppercase text-sm`
13. Settings grid cards: keep swiss-card, remove shadow
14. `w-10 h-10 rounded-xl bg-orange-50` icon → `w-10 h-10 border-2 border-black dark:border-white flex items-center justify-center`
15. `text-xs.font-bold.text-gray-500.uppercase.tracking-wider` → keep this (already Swiss-ish), update color to match
16. `p-5.hover:bg-gray-50.dark:hover:bg-gray-800.transition-colors.group` → keep as is (just a list item)
17. Theme toggle section: the color swatch buttons `w-10 h-10 rounded-full` → `w-10 h-10 border-2 border-black dark:border-white`
18. `rounded-full ring-2 ring-offset-2` → remove ring, use border-2 border-swiss-red
19. Toggle switch: keep the visual, make it rectangular with border
20. `rounded-xl bg-[#EAF4F8]` → `border-2 border-black dark:border-white`
21. `rounded-xl bg-primary/10 text-primary` Lock icon → `bg-black text-white dark:bg-white dark:text-black`
22. `bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md rounded-xl` AI button → `swiss-btn bg-black hover:bg-swiss-red`
23. AI Health section: `rounded-2xl border border-emerald-100/50 shadow-sm bg-gradient-to-br from-emerald-50/30` → `border-2 border-black dark:border-white p-0 overflow-hidden`
24. `rounded-full bg-emerald-100` → square with border
25. Pin modal: `rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-enter` → `border-2 border-black dark:border-white p-6 w-full max-w-sm`
26. `rounded-full bg-primary/10` → square `bg-black text-white dark:bg-white dark:text-black`
27. `text-xl.font-bold.text-gray-900` → `text-xl font-black uppercase text-black dark:text-white`
28. `px-4.py-3.rounded-xl.text-xs.font-bold.text-red-600` error box → `border-2 border-swiss-red bg-swiss-red/5 text-swiss-red`

---

## File 7: src/pages/AuthPage.tsx

Current: Full gradient background, `rounded-2xl`, `rounded-xl`, `rounded-full`, `shadow-[...]`, `backdrop-blur`, `bg-gradient-*`, colored styles.

Replace:
1. Background: Keep it dark but switch to `bg-black` with a simple pattern overlay instead of the blue gradient
2. All `rounded-2xl`, `rounded-xl`, `rounded-full` → remove
3. `rounded-3xl overflow-hidden bg-white/95 backdrop-blur-xl shadow-[...] border` → `bg-white dark:bg-black border-2 border-black dark:border-white`
4. The tab bar: `border-b border-gray-100` tabs → `border-b-2 border-black dark:border-white`
5. Active tab: `text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-500 bg-primary/5` → `text-black dark:text-white border-b-2 border-black dark:border-white font-black`
6. Inactive tab: `text-gray-500 dark:text-gray-400 border-b-2 border-transparent` → keep as is but remove rounded
7. Input fields: `rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2` → `swiss-input bg-transparent border-2 border-black dark:border-white`
8. Submit button: `rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#3B6D8C] shadow-[...]` → `swiss-btn w-full`
9. `rounded-xl text-xs font-bold text-red-600 bg-red-50` error → `border-2 border-swiss-red bg-swiss-red/5 text-swiss-red font-bold text-xs`
10. `w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-[10px] border` logo → `border-2 border-white p-4`
11. `text-3xl font-bold text-white mb-2` → `text-4xl font-black text-white uppercase tracking-tighter`
12. `text-sm` subtitle → `text-[10px] font-bold uppercase tracking-wider text-white/60`
13. Make the icon inside logo: replace Sparkles with a simple Package icon or nothing
14. Input icons (Mail, Lock, User): keep but make them white or text-gray-400
15. Label text: `text-xs font-bold text-gray-500 mb-1.5 block` → keep font-bold but uppercase
16. The background decorative circles → replace with Swiss grid pattern overlay or remove
17. Focus rings on inputs → replace with border-black focus
18. Toggle between login/register: keep text link but make it black/white
19. Replace `hover:opacity-90 active:scale-[0.98]` with `hover:bg-swiss-red hover:border-swiss-red`
20. `px-8 py-6 space-y-5` inside form → keep spacing

---

## File 8: src/components/AIChat.tsx

Current: Heavy gradients, `rounded-2xl`, `rounded-xl`, `rounded-full`, `shadow-2xl`, `backdrop-blur-xl`, CSS variables, `bg-primary`, colored buttons, `animate-enter`, framer-like animations.

Replace:
1. ALL `rounded-2xl`, `rounded-xl`, `rounded-lg` → remove throughout
2. ALL `rounded-full` → remove (make FAB buttons square)
3. ALL `shadow-*`, `shadow-lg`, `shadow-2xl`, `shadow-xl` → remove
4. ALL `backdrop-blur-xl`, `backdrop-blur-md`, `backdrop-blur-sm` → remove
5. ALL `bg-gradient-*` → solid bg-black or bg-swiss-red
6. ALL CSS variable colors `rgb(var(--color-primary))` → `bg-black` or `bg-swiss-red`
7. `animate-enter` → `swiss-enter`
8. Chat button (FAB): `w-14 h-14 rounded-full shadow-xl bg-gradient-to-r from-[...]` → `w-14 h-14 border-2 border-black dark:border-white bg-black dark:bg-white flex items-center justify-center`
9. Camera button: `w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-[#10B981]` → `w-14 h-14 border-2 border-black dark:border-white bg-black flex items-center justify-center`
10. Chat panel: `rounded-[1.5rem] bg-white/95 backdrop-blur-xl border shadow-2xl` → `border-2 border-black dark:border-white bg-white dark:bg-black`
11. Panel width/height: keep the same dimensions
12. Header: `bg-gradient-to-r from-[...]` → `bg-black dark:bg-white`
13. Header text: keep white or black depending on bg
14. Messages: user bubble `rounded-2xl text-white bg-gradient-to-r from-[...]` → `bg-black text-white px-4 py-3 border-2 border-black dark:border-white`
15. Assistant bubble: `rounded-2xl bg-gray-100` → `border-2 border-black dark:border-white px-4 py-3 bg-white dark:bg-black`
16. Welcome card: `rounded-2xl bg-blue-50 border` → `border-2 border-black dark:border-white p-4`
17. Quick-action buttons: `rounded-xl border border-gray-100` → `border-2 border-black dark:border-white px-3 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white`
18. Pending actions card: `rounded-2xl overflow-hidden border-2 border-blue-200` → `border-2 border-black dark:border-white`
19. Pending header: `bg-[#E3F2FD]` → `bg-black text-white dark:bg-white dark:text-black`
20. edit selects/inputs: use `border-2 border-black dark:border-white`
21. Confirm/cancel buttons: `rounded-xl` → remove, use swiss-btn pattern
22. `bg-primary dark:bg-blue-600` → `bg-black dark:bg-white`
23. Input area: `rounded-xl bg-gray-50 border border-gray-200 focus:border-primary` → `swiss-input border-2 border-black dark:border-white`
24. Send button: `rounded-xl bg-primary` → `bg-black dark:bg-white border-2 border-black dark:border-white`
25. Vision overlay: remove glass morphism, use solid black bg
26. `shadow-[0_0_50px_rgba(16,185,129,0.15)]` → remove
27. `border-[3px] border-emerald-500/60 rounded-3xl backdrop-blur-md` → `border-2 border-white`
28. `text-transparent bg-clip-text bg-gradient-to-r from-emerald-300` → `text-white font-black`
29. Remove `@keyframes chatEnter` and use `swiss-enter` instead
30. `overflow-hidden` on panel → keep

---

## File 9: src/components/FamilyModal.tsx

Current: Uses framer-motion (AnimatePresence, motion.div), `rounded-2xl`, `rounded-xl`, `rounded-lg`, `rounded-full`, `shadow-xl`, `bg-primary`, `backdrop-blur-sm`, gradients, `animate-enter`.

Replace:
1. REMOVE framer-motion entirely: delete `import { motion, AnimatePresence } from 'framer-motion'`
2. Remove AnimatePresence wrapper
3. Remove all `motion.div` → use regular `div`
4. Remove all `initial`, `animate`, `exit`, `transition` props
5. Instead of framer-motion animations, use `swiss-enter` CSS class
6. `rounded-2xl shadow-xl overflow-hidden` → `border-2 border-black dark:border-white overflow-hidden`
7. `rounded-xl` → remove throughout
8. `rounded-lg` → remove throughout
9. `rounded-full` → make square
10. `bg-black/40 backdrop-blur-sm` overlay → `bg-black/60` (no blur)
11. Header: `bg-gray-50 dark:bg-slate-800` → `bg-black dark:bg-white`
12. `text-xl font-bold flex items-center gap-2 text-[#2A4D63] dark:text-blue-400` → `text-xl font-black uppercase tracking-wider text-white dark:text-black flex items-center gap-2`
13. Close button: `rounded-full hover:bg-gray-200` → `border-2 border-white dark:border-black p-1 hover:bg-swiss-red`
14. `text-sm font-semibold text-gray-500 uppercase tracking-wider` → `text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400`
15. `rounded-xl border border-gray-100 bg-gray-50` invite code box → `border-2 border-black dark:border-white p-4`
16. Copy button: `p-3 bg-white shadow-sm border border-gray-100 rounded-xl` → `p-3 border-2 border-black dark:border-white hover:bg-black hover:text-white`
17. Input field: `rounded-xl focus:border-primary` → `swiss-input border-2 border-black dark:border-white`
18. Join button: `rounded-xl font-medium shadow-md bg-primary` → `swiss-btn`
19. Space cards: `rounded-xl cursor-pointer border-2 transition-all` → keep border-2, keep cursor-pointer
20. Active space: `border-primary dark:border-blue-500 bg-primary/5` → `border-swiss-red bg-swiss-red/5`
21. Inactive space: `border-transparent hover:bg-gray-50` → `border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900`
22. `p-2 rounded-lg bg-primary/10 text-primary` → `p-2 bg-black text-white dark:bg-white dark:text-black`
23. `rounded-xl bg-gray-50 border border-dashed` empty state → `border-2 border-dashed border-black dark:border-white p-4`
24. Member items: `rounded-lg border border-gray-50 bg-gray-50` → `border-2 border-black dark:border-white p-3`
25. `w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 shadow-sm ring-2 ring-white` avatar → `w-8 h-8 border-2 border-black dark:border-white flex items-center justify-center bg-black text-white dark:bg-white dark:text-black font-bold text-sm`
26. Role select: `rounded py-1 pl-2 pr-6` → add `border-2 border-black dark:border-white`
27. Kick button: `rounded bg-red-50` → `border-2 border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white`
28. `shadow-sm border border-green-100` role badge → `border-2 border-black dark:border-white px-2 py-0.5 text-[10px] font-bold`
29. `border-t border-gray-100` dividers → `border-t-2 border-black dark:border-white`

---

## IMPORTANT EXECUTION NOTES

1. Edit each file one at a time
2. Read the file first, then apply ALL changes in a single edit
3. Do NOT leave any old class names behind — be thorough
4. After editing, verify:
   - No `rounded-*`, `shadow-*`, `bg-gradient-*`, `backdrop-blur-*` remain
   - No `card`, `btn-primary`, `btn-secondary`, `btn-outline`, `input-field` classes remain  
   - No `animate-enter` — all should be `swiss-enter`
   - No framer-motion imports or usage
   - No CSS variable colors `rgb(var(--color-*))`
   - No `bg-primary` or `text-primary` (those are removed from tailwind config)
5. Start with Items.tsx, then ItemForm.tsx, Locations.tsx, FloorPlan.tsx, BatchManage.tsx, Settings.tsx, AuthPage.tsx, AIChat.tsx, FamilyModal.tsx
