Apply Swiss Design System to D:\home-storage\src\components\FamilyModal.tsx.

Read the file first, then apply these changes. Keep ALL logic identical.

IMPORTANT: This file uses framer-motion (AnimatePresence + motion.div). You MUST:
1. Remove the framer-motion import: `import { motion, AnimatePresence } from 'framer-motion'`
2. Remove the AnimatePresence wrapper
3. Replace all `motion.div` with regular `div`
4. Remove all `initial`, `animate`, `exit`, `transition` props
5. Add `swiss-enter` class for entrance animation

Other changes:
6. Overlay: remove `bg-black/40 backdrop-blur-sm`. Use `bg-black/60`
7. Modal card: remove `rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] my-4 mx-4 border border-transparent dark:border-slate-700`. Use: `w-full max-w-md border-2 border-black dark:border-white bg-white dark:bg-black overflow-hidden flex flex-col max-h-[90vh] my-4 mx-4 swiss-enter`
8. Header: change `bg-gray-50 dark:bg-slate-800` to `bg-black dark:bg-white`
9. Header text: `text-xl font-bold flex items-center gap-2 text-[#2A4D63] dark:text-blue-400` → `text-xl font-black uppercase tracking-wider text-white dark:text-black flex items-center gap-2`
10. Close button: `p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full` → `p-2 border-2 border-white/50 dark:border-black/50 hover:bg-swiss-red hover:text-white`
11. Section headings: `text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider` → `text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400`
12. Invite code box: `p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700` → `p-4 border-2 border-black dark:border-white`
13. Invite code text: `text-2xl font-mono font-bold tracking-widest text-gray-800 dark:text-gray-100` → keep
14. Copy button: `p-3 bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-600 rounded-xl hover:bg-gray-50` → `p-3 border-2 border-black dark:border-white hover:bg-black hover:text-white`
15. Join input: `rounded-xl focus:border-primary dark:focus:border-blue-500 focus:ring-1 focus:ring-primary/50` → `border-2 border-black dark:border-white px-4 py-3 bg-transparent outline-none font-mono`
16. Join button: remove `rounded-xl shadow-md bg-primary dark:bg-blue-600 hover:bg-primary-dark`. Change to: `px-5 py-3 swiss-btn flex items-center gap-2`
17. Space cards: keep `rounded-xl cursor-pointer border-2 transition-all`. Remove rounded-xl. For active: `border-primary dark:border-blue-500 bg-primary/5` → `border-swiss-red bg-swiss-red/5`. For inactive: `border-transparent hover:bg-gray-50` → `border-2 border-black dark:border-white hover:bg-gray-100`
18. Space icons: `p-2 rounded-lg bg-primary/10 text-primary dark:bg-blue-900/30` → `p-2 bg-black dark:bg-white text-white dark:text-black`
19. Space name text: use black/white instead of primary colors
20. Edit alias button: keep as is
21. Role badges: remove `rounded shadow-sm border border-green-100`. Use `border-2 border-black dark:border-white px-2 py-0.5 text-[10px] font-bold`
22. Leave button: keep opacity-0 on hover, use `text-swiss-red hover:bg-swiss-red/10`
23. Empty state: `rounded-xl border border-dashed border-gray-200` → `border-2 border-dashed border-black dark:border-white p-4`
24. Member items: `rounded-lg border border-gray-50 bg-gray-50 dark:bg-slate-900/50 hover:bg-white hover:border-gray-200` → `border-2 border-black dark:border-white hover:bg-gray-100 p-3`
25. Member avatar: `w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 shadow-sm ring-2 ring-white dark:ring-slate-800` → `w-8 h-8 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold text-sm flex items-center justify-center`
26. Kick button: remove `rounded bg-red-50`. Use `border-2 border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white px-2 py-1 text-xs`
27. Role select: add `border-2 border-black dark:border-white`
28. All dividers: `border-t border-gray-100` → `border-t-2 border-black dark:border-white`
29. `border-b border-gray-100` → `border-b-2 border-black dark:border-white`
30. All dashed borders: keep the dash but use black/white

Edit the file now.