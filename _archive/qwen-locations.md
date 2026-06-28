Apply Swiss Design System to D:\home-storage\src\pages\Locations.tsx.

Read the file first, then apply these className changes. Keep ALL logic identical.

Classes to replace:
1. `animate-enter` → `swiss-enter`
2. All `card` → `swiss-card`
3. All `btn-primary` → `swiss-btn`
4. All `input-field` → `swiss-input`
5. Remove ALL `rounded-2xl`, `rounded-xl`, `rounded-lg`, `rounded-full`, `rounded-3xl`
6. Remove ALL `shadow-*`, `shadow-sm`, `shadow-2xl`, `shadow-md`
7. Remove ALL `backdrop-blur-sm`
8. Remove ALL `ring-*`

Specific changes:
9. `text-2xl font-bold dark:text-gray-100` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white`
10. `text-sm text-gray-500 dark:text-gray-400 mt-1` → `text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1`
11. `text-xl font-bold dark:text-gray-100` → `text-xl font-black uppercase tracking-wider text-black dark:text-white`
12. `text-xl font-bold flex items-center gap-2 text-[#2A4D63] dark:text-blue-400` → `text-xl font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2`
13. `rounded-3xl shadow-2xl p-8 max-w-md w-full animate-enter border border-transparent dark:border-slate-700` modal → `border-2 border-black dark:border-white bg-white dark:bg-black p-8 max-w-md w-full swiss-enter`
14. Modal close: `p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700` → `p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white`
15. Type buttons active: `bg-[#EAF4F8] border-[#3B6D8C] text-[#3B6D8C] dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 shadow-md` → `bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white`
16. Type buttons inactive: `bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-gray-300` → `bg-transparent text-gray-600 dark:text-gray-400 border-2 border-black dark:border-white hover:bg-black hover:text-white`
17. Empty state: `card text-center py-16` → `swiss-card text-center py-16`
18. Empty icon: `w-20 h-20 mx-auto rounded-full bg-gray-50 dark:bg-slate-900/50 border border-transparent` → `w-20 h-20 mx-auto border-4 border-black dark:border-white flex items-center justify-center`
19. `btn-primary mx-auto` → `swiss-btn mx-auto`
20. Room card: `card overflow-hidden` → `swiss-card`
21. Room icon: `w-12 h-12 rounded-2xl bg-[#EAF4F8] dark:bg-slate-700/50` → `w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center text-2xl`
22. Room name: `font-bold text-gray-900 dark:text-gray-100 truncate` → `font-bold text-black dark:text-white uppercase truncate`
23. Room action buttons: `p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700` → `p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white`
24. Delete button specifically: `p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30` → `p-2 border-2 border-swiss-red hover:bg-swiss-red hover:text-white`
25. Toggle expand: `p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700` → `p-1 border-2 border-black dark:border-white hover:bg-black hover:text-white`
26. Children container: `mt-4 ml-10 space-y-2 pt-4 border-t border-gray-100 dark:border-slate-700/50` → `mt-4 ml-10 space-y-2 pt-4 border-t-2 border-black dark:border-white`
27. Child items: `rounded-2xl bg-gray-50/80 dark:bg-slate-900/50 group hover:bg-gray-100 dark:hover:bg-slate-900 border border-transparent dark:border-slate-800` → `border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 group`
28. Child action buttons: `p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 bg-white md:bg-transparent shadow-sm` → `p-1.5 border-2 border-black dark:border-white hover:bg-black hover:text-white md:border`
29. Child delete: `p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 bg-white md:bg-transparent shadow-sm` → `p-2 border-2 border-swiss-red hover:bg-swiss-red hover:text-white`
30. `border-t border-gray-100 dark:border-slate-700` → `border-t-2 border-black dark:border-white`
31. Orphan section: `card` → `swiss-card`
32. Orphan items: same treatment as child items
33. Instruction labels: `text-sm font-bold text-gray-600 dark:text-gray-300 mb-2` → `text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2`
34. `text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider` → `text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400`

Edit the file now.