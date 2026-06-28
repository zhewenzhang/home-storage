# Swiss Design Redesign — Batch 1: Items, ItemForm, Locations, FloorPlan

Apply Swiss Design System to these 4 files. Rules for ALL files:
- Replace `card` → `swiss-card`
- Replace `btn-primary` → `swiss-btn`
- Replace `input-field` → `swiss-input`
- Remove ALL `rounded-*`, `shadow-*`, `ring-*`, `animate-enter` classes
- Replace `animate-enter` with `swiss-enter`
- Replace `bg-primary`, `text-primary` → `bg-black`, `text-black` (or `bg-swiss-red`, `text-swiss-red`)
- Replace `bg-gradient-*` → solid colors
- Replace `bg-primary/5` → `bg-swiss-red/5`
- No rounded corners anywhere — use `border-2 border-black dark:border-white`
- Uppercase headings with `font-black`, `tracking-*` classes
- Labels should be `text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400`

---

## src/pages/Items.tsx

Read the file first. Then REPLACE entire content. Keep all logic identical, only change className values.

Key changes:
1. `className="space-y-6 animate-enter max-w-3xl mx-auto"` → `className="space-y-6 swiss-enter max-w-3xl mx-auto"`
2. Heading: `text-2xl font-bold dark:text-gray-100` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white`
3. Subtitle: `text-sm text-gray-500 dark:text-gray-400 mt-1` → `text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1`
4. Add button: `btn-primary` → `swiss-btn`
5. Category filters — active: `bg-primary dark:bg-blue-600 text-white border-transparent shadow-md` → `bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white`
6. Category filters — inactive: `bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-gray-300` → `bg-transparent text-gray-500 dark:text-gray-400 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black`
7. Empty state: `card text-center py-16` → `swiss-card text-center py-16`
8. Empty state icon: `w-20 h-20 mx-auto rounded-full bg-gray-50` → `w-20 h-20 mx-auto border-4 border-black dark:border-white flex items-center justify-center`
9. Location card: `card` → `swiss-card`
10. Location header dot: `w-3 h-3 rounded-full bg-primary` → `w-3 h-3 bg-black dark:bg-white`
11. Item row: remove `rounded-2xl`, remove `bg-gray-50/80 dark:bg-slate-900/50`, remove `border border-transparent dark:border-slate-800`, add `border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900`
12. Item image: `w-10 h-10 rounded-xl border border-gray-200` → `w-10 h-10 border-2 border-black dark:border-white`
13. Item emoji placeholder: `w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-gray-200` → `w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-black`
14. Expiry badge: remove `rounded-full`, replace with `border-2 border-black dark:border-white px-2 py-0.5`
15. Edit/delete buttons: remove `rounded-xl`, `shadow-sm`, replace with `border-2 border-black dark:border-white p-2`
16. `bg-red-100 text-red-600` → `text-swiss-red`
17. `bg-yellow-100 text-yellow-700` → `text-black dark:text-white`
18. `bg-green-50 text-green-600` → `text-gray-500 dark:text-gray-400`
19. `rounded-full bg-gray-300` unassigned dot → `w-3 h-3 bg-gray-300`
20. `btn-primary mx-auto` → `swiss-btn mx-auto`

---

## src/pages/ItemForm.tsx

Read first, then replace.

1. Heading: `text-2xl font-bold flex-1 dark:text-gray-100` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white flex-1`
2. Back button: remove `rounded-2xl`, `shadow-sm`, `border border-gray-100`. Replace with `border-2 border-black dark:border-white p-2`
3. Delete button: remove `rounded-2xl bg-red-50`, replace with `border-2 border-swiss-red p-2`
4. All `card` → `swiss-card`
5. All `input-field` → `swiss-input`
6. Label: `text-sm font-bold text-gray-600 dark:text-gray-300 mb-3` → `text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3`
7. Category buttons — active: `bg-primary dark:bg-blue-600 text-white border-transparent shadow-md` → `bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white`
8. Category buttons — inactive: `bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-primary` → `bg-transparent text-gray-600 dark:text-gray-400 border-2 border-black dark:border-white hover:bg-black hover:text-white`
9. Quantity buttons: remove `rounded-2xl bg-gray-100 dark:bg-slate-700`, add `border-2 border-black dark:border-white`
10. Quantity input: replace `input-field` with `swiss-input`, remove `rounded-lg`
11. Image upload area: remove `rounded-2xl`, `rounded-xl`, keep `border-2 border-dashed`
12. Image remove button: remove `rounded-full`, `backdrop-blur-sm`, make it a square button
13. AI analyze button: remove `rounded-full`, `backdrop-blur-md`, `shadow-lg`, change to `border-2 border-white bg-black/60 text-white`
14. Upload placeholder: remove `rounded-2xl shadow-sm`, add `border-2 border-black dark:border-white`
15. Location select: `input-field` → `swiss-input`
16. Location empty state: remove `rounded-2xl`, keep it rectangular
17. Expiry date input: `input-field` → `swiss-input`
18. Expiry quick buttons: change to `border-2 border-black dark:border-white px-3 py-1.5 text-xs font-bold hover:bg-black hover:text-white`. Remove colored bg classes.
19. Textarea: `input-field` → `swiss-input`
20. Submit button: `btn-primary w-full` → `swiss-btn w-full`

---

## src/pages/Locations.tsx

Read first, then replace.

1. `animate-enter` → `swiss-enter`
2. Heading: `text-2xl font-bold dark:text-gray-100` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white`
3. Subtitle: `text-sm text-gray-500 dark:text-gray-400 mt-1` → `text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1`
4. Add button: `btn-primary` → `swiss-btn`
5. Modal overlay: remove `backdrop-blur-sm`. Overlay div: `bg-black/20` → `bg-black/60`
6. Modal content: remove `rounded-3xl shadow-2xl border border-transparent`. Replace with `border-2 border-black dark:border-white bg-white dark:bg-black`
7. Modal header: `text-xl font-bold` → `text-xl font-black uppercase tracking-wider text-black dark:text-white`
8. Modal close: remove `rounded-xl`, replace with `border-2 border-black dark:border-white p-2`
9. Modal input: `input-field` → `swiss-input`
10. Type grid: active button: `bg-[#EAF4F8] border-[#3B6D8C] text-[#3B6D8C] shadow-md` → `bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white`
11. Type grid: inactive button: `bg-white dark:bg-slate-800 border-gray-200 text-gray-600` → `bg-transparent border-2 border-black dark:border-white text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white`
12. Modal select: `input-field` → `swiss-input`
13. Modal buttons: `btn-primary flex-1` → `swiss-btn flex-1`, `btn-secondary` → `swiss-btn-outline`
14. Empty state: `card text-center py-16` → `swiss-card text-center py-16`
15. Empty icon: `w-20 h-20 mx-auto rounded-full bg-gray-50` → `w-20 h-20 mx-auto border-4 border-black dark:border-white flex items-center justify-center`
16. `btn-primary mx-auto` → `swiss-btn mx-auto`
17. Room card: `card overflow-hidden` → `swiss-card`
18. Room icon: `w-12 h-12 rounded-2xl bg-[#EAF4F8]` → `w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center text-2xl`
19. Room name: `font-bold text-gray-900 dark:text-gray-100` → `font-bold text-black dark:text-white uppercase`
20. Room action buttons (QR, Edit, Delete): remove `rounded-xl`, replace with `border-2 border-black dark:border-white p-2`
21. Children container: `border-t border-gray-100` → `border-t-2 border-black dark:border-white`
22. Child item: remove `rounded-2xl bg-gray-50/80 dark:bg-slate-900/50 border border-transparent`. Add `border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900`
23. Child action buttons: same as room, border-2 style
24. Orphan section heading: `text-sm font-bold text-gray-400` → `text-xs font-black uppercase tracking-wider text-gray-400`
25. Orphan items: same Swiss style as child items

---

## src/pages/FloorPlan.tsx

Read first, then replace. Keep all SVG/drag logic identical.

1. `animate-enter` → `swiss-enter`
2. Heading: `text-2xl font-bold` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white`
3. Subtitle: `text-sm text-gray-500 mt-1` → `text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1`
4. Toolbar: `card` → `swiss-card`
5. Tool buttons — active: `rounded-xl bg-primary dark:bg-blue-600 text-white shadow-lg` → `border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold`
6. Tool buttons — inactive: `rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 hover:bg-gray-200` → `border-2 border-black dark:border-white bg-transparent text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white`
7. Room picker dropdown: `rounded-2xl shadow-2xl border border-gray-100` → `border-2 border-black dark:border-white bg-white dark:bg-black p-3`
8. Room type buttons: `rounded-xl bg-gray-50 hover:bg-[#EAF4F8]` → `border-2 border-black dark:border-white p-3 hover:bg-black hover:text-white hover:border-swiss-red`
9. Cabinet add button: remove amber bg colors, use `border-2 border-black dark:border-white`
10. Cabinet picker: same treatment as room picker
11. Delete button: `rounded-xl bg-red-50` → `border-2 border-swiss-red hover:bg-swiss-red hover:text-white p-2`
12. Save button: `btn-primary` → `swiss-btn`
13. Canvas container: `card p-3 overflow-hidden` → `swiss-card p-0 overflow-hidden`
14. Remove the gradient scrims (the w-6 gradient divs)
15. Canvas overflow: remove `rounded-2xl`
16. Room elements: keep the SVG/touch logic. For the room border: `border-[#3A3A3A]` → `border-black dark:border-white`. Room background: `bg-white` → keep. Wall color: use black.
17. Selection shadow: remove `shadow-[0_0_0_3px_rgba(37,99,235,0.25)]`, replace with `ring-0` (no ring)
18. Dimension labels background: `bg-[#F5F5F0] rounded` → `bg-transparent border border-black`
19. Resize handles: `bg-blue-600 rounded-full` → `bg-black w-6 h-6 flex items-center justify-center`
20. Cabinet dots: keep rounded (they are visual markers), but change colors: `#3B82F6` selection → `#FF3000`, cabinet config colors → black
21. Selected info panel: `card` → `swiss-card`. Replace `border-l-4 border-[#3B6D8C]` with `border-2 border-swiss-red`
22. Info panel icon: `w-12 h-12 rounded-2xl` → `w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center text-2xl`
23. Info panel input: inline-editable, keep as is but make border black on focus
24. Dimension inputs: remove `rounded-lg`, `focus:ring-2`, use `border-2 border-black dark:border-white`
25. Room select: remove `rounded-xl`, use `swiss-input`
26. Bottom hint: keep text-center but update to uppercase tracking-wider

IMPORTANT: Edit each file by reading it first, then writing the complete new content.
