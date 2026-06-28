Apply Swiss Design System to D:\home-storage\src\pages\Settings.tsx.

Read the file first, then apply these className changes. Keep ALL logic identical.

Changes:
1. `animate-enter` → `swiss-enter`
2. All `card` → `swiss-card`
3. `btn-outline` → `swiss-btn-outline`
4. Remove ALL `rounded-xl`, `rounded-2xl`, `rounded-3xl`
5. Remove ALL `rounded-full` — make avatars square with border
6. Remove ALL `shadow-*`, `shadow-sm`, `shadow-2xl`, `shadow-[...]`
7. Remove ALL `bg-gradient-*`, `bg-gradient-to-br`, `bg-gradient-to-r`
8. Remove ALL `backdrop-blur-sm`, `backdrop-blur-xl`
9. Remove ALL `ring-*`, `ring-offset-*`
10. No `bg-primary` or `text-primary`

Specific changes:
11. Main heading: `text-2xl font-bold flex items-center gap-2 text-primary-dark dark:text-blue-400` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2`
12. Subtitle: `text-sm text-gray-500 dark:text-gray-400 mt-1` → `text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1`
13. Account card: remove `bg-gradient-to-br from-white to-blue-50/30`, use `swiss-card` instead
14. Section heading: `text-xs font-bold text-blue-800/60 dark:text-blue-400/80 uppercase tracking-wider mb-4` → `text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4`
15. Avatar: `w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-sm` → `w-16 h-16 border-2 border-black dark:border-white flex items-center justify-center`
16. Email: `text-sm text-gray-500 dark:text-gray-400` — keep
17. Logout button: keep border style but change to: `border-2 border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white font-bold uppercase text-sm px-4 py-2 flex items-center gap-2`
18. Settings grid cards: `card p-0 overflow-hidden border border-gray-100/50 dark:border-gray-800 shadow-sm` → `swiss-card p-0 overflow-hidden`
19. Card headers: `bg-gray-50/50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800` → `bg-gray-100 dark:bg-gray-900 border-b-2 border-black dark:border-white`
20. Card header text: `text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider` → keep
21. List items: `p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group` — keep
22. Link icons: `w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500` → `w-10 h-10 border-2 border-black dark:border-white flex items-center justify-center`
23. Link text: `font-bold text-sm text-gray-800 dark:text-gray-100` → `font-bold text-sm text-black dark:text-white uppercase`
24. Link subtext: `text-xs text-gray-400 mt-0.5` → keep
25. Theme color swatches: `w-10 h-10 rounded-full flex items-center justify-center` → `w-10 h-10 border-2 border-black dark:border-white flex items-center justify-center`
26. Active swatch: `ring-2 ring-offset-2 ring-primary dark:ring-offset-gray-800 scale-110` → `border-swiss-red border-2`
27. `rounded-xl bg-purple-50 icon` → square with border
28. App Lock card: same treatment
29. `p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer` — keep but remove rounded
30. Lock icon: `w-10 h-10 rounded-xl bg-primary/10 text-primary` → `w-10 h-10 border-2 border-black dark:border-white flex items-center justify-center`
31. Toggle switch: `rounded-full` → remove rounded. `rounded-full transition-colors` → `border-2 border-black dark:border-white`
32. `rounded-full bg-white transition-transform` → square white indicator
33. AI Health section: `card p-0 overflow-hidden border border-emerald-100/50 dark:border-emerald-900/50 shadow-sm bg-gradient-to-br from-emerald-50/30 dark:from-emerald-900/10` → `swiss-card p-0 overflow-hidden`
34. AI header: `border-b border-emerald-100/50 dark:border-emerald-800/30` → `border-b-2 border-black dark:border-white`
35. AI icon circle: `p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-full` → `p-4 border-2 border-black dark:border-white`
36. AI generate button: remove `rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md`. Change to: `px-6 py-2.5 swiss-btn`
37. Pin modal: remove `rounded-3xl shadow-2xl`, add `border-2 border-black dark:border-white`
38. `rounded-full bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-400` → `w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center`
39. `text-xl font-bold text-gray-900 dark:text-gray-100` → `text-xl font-black uppercase tracking-wider text-black dark:text-white`
40. `p-4 py-3 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30` → `border-2 border-swiss-red bg-swiss-red/5 text-swiss-red text-xs font-bold p-4 py-3`
41. `text-xs text-gray-400 dark:text-gray-500` — keep
42. Dividers: `divide-y divide-gray-50 dark:divide-gray-800` → `divide-y-2 divide-black dark:divide-white`
43. `border-t border-gray-100 dark:border-slate-700` → `border-t-2 border-black dark:border-white`
44. `border-b border-gray-100 dark:border-gray-800` → `border-b-2 border-black dark:border-white`
45. `rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400` check update → `border-2 border-black dark:border-white px-2 py-0.5 text-[10px] font-bold`

Edit the file now.