Apply Swiss Design System to D:\home-storage\src\pages\FloorPlan.tsx.

Read the file first, then apply these className changes. Keep ALL logic, SVG rendering, drag/resize identical.

Changes:
1. `animate-enter` → `swiss-enter`
2. All `card` → `swiss-card`
3. All `btn-primary` → `swiss-btn`
4. Remove ALL `rounded-2xl`, `rounded-xl`, `rounded-lg`, `rounded-full`
5. Remove ALL `shadow-*`, `shadow-lg`, `shadow-2xl`, `shadow-md`, `shadow-sm`
6. Remove ALL `ring-*`, `focus:ring-*`
7. Remove ALL `bg-gradient-to-r`
8. Heading: `text-2xl font-bold` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white`
9. Subtitle: `text-sm text-gray-500 mt-1` → `text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1`
10. Toolbar: `card` → `swiss-card` (already covered)
11. Tool buttons active: `rounded-xl bg-primary dark:bg-blue-600 text-white shadow-lg` → `border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold`
12. Tool buttons inactive: `rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200` → `border-2 border-black dark:border-white bg-transparent text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white`
13. Room picker dropdown: `rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-3 z-50 w-56 animate-enter` → `border-2 border-black dark:border-white bg-white dark:bg-black p-3 z-50 w-56 swiss-enter`
14. Room type buttons: `rounded-xl bg-gray-50 dark:bg-slate-900/50 hover:bg-[#EAF4F8] text-center group border border-transparent dark:border-slate-700` → `border-2 border-black dark:border-white p-3 text-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black`
15. Cabinet button: Remove amber colors. Change to: `border-2 border-black dark:border-white bg-transparent text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white`
16. Cabinet picker dropdown: Same as room picker — Swiss border style
17. Delete button: `rounded-xl bg-red-50 dark:bg-red-900/30 hover:bg-red-100 disabled:opacity-30` → `p-2 border-2 border-swiss-red hover:bg-swiss-red hover:text-white disabled:opacity-30 disabled:cursor-not-allowed`
18. Canvas container: Remove all rounded. Keep overflow-hidden
19. Room rendering div: `border-blue-600` → `border-swiss-red`. `border-[#3A3A3A]` → `border-black dark:border-white`
20. Resize handles: `bg-blue-600 rounded-full` → `bg-black w-6 h-6 flex items-center justify-center border-2 border-white dark:border-black`
21. Resize corner dots: `bg-blue-500 rounded-full` → `bg-black w-5 h-5 border-2 border-white dark:border-black`
22. Selected room shadow: `shadow-[0_0_0_3px_rgba(37,99,235,0.25)]` → remove
23. Dimension labels bg: `bg-[#F5F5F0] dark:bg-slate-700 px-1.5 py-0.5 rounded` → `px-1.5 py-0.5 border border-black dark:border-white`
24. Cabinet dots: keep rounded (they are visual markers), change selection color from `#3B82F6` to `#FF3000`. Cabinet config colors: change to black default.
25. Selected info panel: `card` → `swiss-card`. Replace `border-l-4 border-[#3B6D8C]` with just Swiss styling
26. Panel icon: `w-12 h-12 rounded-2xl bg-[#EAF4F8] dark:bg-slate-700/50` → `w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center`
27. Dimension inputs: `rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-center font-bold text-sm focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/10 outline-none` → `w-16 px-2 py-1.5 border-2 border-black dark:border-white text-center font-bold text-sm outline-none bg-transparent`
28. Room select: `rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 text-sm font-bold focus:border-primary focus:ring-2 focus:ring-primary/10` → `flex-1 px-3 py-2 border-2 border-black dark:border-white text-sm font-bold bg-transparent`
29. Panel name input: `font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-primary outline-none` → `font-bold text-black dark:text-white bg-transparent border-b-2 border-black dark:border-white outline-none`
30. Remove the gradient scroll scrims (the w-6 gradient divs)
31. Bottom hint: `text-center text-xs text-gray-400` → `text-center text-[10px] text-gray-400 font-bold uppercase tracking-wide`
32. Cabinet shadow: `shadow-md` → remove. `shadow-lg` → remove.
33. Cabinet hover tooltip: `text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-800 text-white shadow-lg` → `text-[10px] font-bold px-2 py-0.5 bg-black text-white border border-white`

Edit the file now.