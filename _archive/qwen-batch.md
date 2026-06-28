Apply Swiss Design System to D:\home-storage\src\pages\BatchManage.tsx.

Read the file first, then apply these className changes. Keep ALL logic identical.

Changes:
1. Remove ALL `rounded-2xl`, `rounded-xl`, `rounded-lg`, `rounded-md`
2. Remove ALL `shadow-*`, `shadow-sm`, `shadow-md`
3. `animate-enter` → `swiss-enter`
4. `bg-primary hover:bg-primary-dark dark:bg-blue-600 dark:hover:bg-blue-700` → `bg-black dark:bg-white text-white dark:text-black hover:bg-swiss-red border-2 border-black dark:border-white font-bold uppercase`
5. `bg-blue-50/50 dark:bg-blue-900/30 rounded-lg border border-blue-100/50 dark:border-blue-900/50 animate-enter` selected toolbar → `border-2 border-black dark:border-white bg-swiss-red/5 p-2 swiss-enter`
6. `text-blue-800 dark:text-blue-300 font-medium` → `text-black dark:text-white font-bold`
7. `btn-outline px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-600` → `border-2 border-black dark:border-white px-3 py-1.5 text-sm font-bold uppercase text-gray-700 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center gap-1.5`
8. Table container: `bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden` → `border-2 border-black dark:border-white overflow-hidden`
9. Table head: `bg-gray-50 dark:bg-slate-900/80 border-b border-gray-100 dark:border-slate-700 text-sm font-semibold text-gray-500 dark:text-gray-400` → `bg-gray-100 dark:bg-gray-900 border-b-2 border-black dark:border-white text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400`
10. Heading h1: `text-2xl font-bold flex items-center gap-2 text-primary-dark dark:text-blue-400` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2`
11. Subtitle: `text-sm text-gray-500 dark:text-gray-400 mt-1` → `text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1`
12. Save button: `px-6 py-2.5 text-white rounded-xl text-sm font-medium shadow-md bg-primary hover:bg-primary-dark` → `swiss-btn`
13. Table data inputs: `bg-transparent border-0 focus:ring-2 focus:ring-primary/30 dark:focus:ring-blue-500/30 rounded-md` → `bg-transparent border-0 border-b-2 border-transparent focus:border-black dark:focus:border-white outline-none`
14. Table selects: `bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50 hover:border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg` → `bg-transparent border-2 border-black dark:border-white outline-none text-sm`
15. Number input: `bg-transparent border border-gray-100 dark:border-slate-700/50 hover:border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg` → `bg-transparent border-2 border-black dark:border-white outline-none text-center`
16. Status badges: `bg-green-50 dark:bg-green-900/30 border border-green-100 text-green-700 dark:text-green-400 rounded-md text-xs font-semibold` → `border-2 border-black dark:border-white text-xs font-bold uppercase px-2 py-0.5`
17. `bg-blue-50 dark:bg-blue-900/30 border border-blue-100 text-primary dark:text-blue-400 rounded-md text-xs font-semibold` → `border-2 border-black dark:border-white text-xs font-bold uppercase px-2 py-0.5`
18. `text-gray-300 dark:text-gray-600 text-xs` — keep as is
19. `bg-primary/5 dark:bg-blue-900/20` selected row → `bg-swiss-red/5`
20. `text-primary dark:text-blue-500` checkboxes → plain
21. Batch edit modal: `bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-transparent dark:border-slate-700` → `bg-white dark:bg-black w-full max-w-sm border-2 border-black dark:border-white overflow-hidden`
22. Modal header: `bg-gray-50 dark:bg-slate-900` → `bg-black dark:bg-white`
23. Modal header text: `text-lg font-bold flex items-center gap-2 text-primary-dark dark:text-blue-400` → `text-lg font-black uppercase tracking-wider text-white dark:text-black flex items-center gap-2`
24. Modal close: `p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full` → `p-2 border-2 border-white/50 dark:border-black/50 hover:bg-swiss-red`
25. Modal selects: `input-field py-2 w-full text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-gray-200` → `border-2 border-black dark:border-white w-full px-3 py-2 bg-transparent text-sm font-bold outline-none`
26. Modal cancel: `px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl` → `px-4 py-2 text-sm font-bold uppercase border-2 border-black dark:border-white hover:bg-black hover:text-white`
27. Modal confirm: `px-4 py-2 text-sm text-white rounded-xl shadow-md bg-primary hover:bg-primary-dark` → `px-4 py-2 text-sm font-bold uppercase swiss-btn`
28. Mobile card container: `divide-y divide-gray-100 dark:divide-slate-700` → `divide-y-2 divide-black dark:divide-white`
29. Mobile select bar: `bg-gray-50 dark:bg-slate-900/80 border-b border-gray-100 dark:border-slate-700` → `bg-gray-100 dark:bg-gray-900 border-b-2 border-black dark:border-white`
30. Mobile label: `text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold block mb-1 tracking-wider` → keep this (already Swiss-ish)

Edit the file now.