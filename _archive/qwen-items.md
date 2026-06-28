Apply Swiss Design System to D:\home-storage\src\pages\Items.tsx.

Context: The app uses Tailwind CSS with a Swiss Design system. swiss-red = #FF3000. Classes available: swiss-card, swiss-btn, swiss-btn-outline, swiss-input, swiss-enter, swiss-section-label. No rounded corners, no shadows, no gradients are allowed.

Read the file first, then apply these changes. The logic must remain identical — only change className values.

1. Change `animate-enter` to `swiss-enter`  
2. `text-2xl font-bold dark:text-gray-100` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white`
3. `text-sm text-gray-500 dark:text-gray-400 mt-1` → `text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1`
4. `btn-primary` → `swiss-btn` everywhere
5. `card` → `swiss-card` everywhere
6. Category filters active: `bg-primary dark:bg-blue-600 text-white border-transparent shadow-md` → `bg-black dark:bg-white text-white dark:text-black font-bold border-2 border-black dark:border-white`
7. Category filters inactive: `bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600` → `bg-transparent text-gray-500 dark:text-gray-400 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black`
8. Replace all instances of `rounded-full` on divs/spans: make them rectangular. For the empty state icon: `w-20 h-20 mx-auto rounded-full bg-gray-50` → `w-20 h-20 mx-auto border-4 border-black dark:border-white flex items-center justify-center`
9. Remove ALL `rounded-2xl`, `rounded-xl` classes
10. Remove ALL `shadow-*`, `shadow-md` classes  
11. Item rows: change from `rounded-2xl bg-gray-50/80 dark:bg-slate-900/50 group transition-all border border-transparent dark:border-slate-800` → `border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-900 group`
12. Item images: `rounded-xl border border-gray-200` → `border-2 border-black dark:border-white`
13. Item emoji: `rounded-xl bg-white dark:bg-slate-800 border border-gray-200` → `border-2 border-black dark:border-white bg-white dark:bg-black`
14. Expiry badge spans: remove rounded-full class. Change color: `bg-red-100 text-red-600` → `text-swiss-red`. `bg-yellow-100 text-yellow-700` → `text-black dark:text-white`. `bg-green-50 text-green-600` → `text-gray-500 dark:text-gray-400`. Add `border-2 border-black dark:border-white px-2 py-0.5 text-[10px] font-bold`
15. Location header dot: `w-3 h-3 rounded-full bg-primary dark:bg-blue-500` → `w-3 h-3 bg-black dark:bg-white`
16. Orphan header dot: `w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600` → `w-3 h-3 bg-gray-300 dark:bg-gray-600`
17. Edit/delete action buttons: remove `rounded-xl shadow-sm` — use `p-2 border-2 border-black dark:border-white` instead
18. Category filter buttons: remove `px-4 py-2 rounded-xl text-sm` → `px-4 py-2 text-sm font-bold uppercase border-2 border-black dark:border-white`
19. "全部" button: same treatment
20. `rounded-full text-[10px] font-bold ${l.color}` → `text-[10px] font-bold border-2 border-black dark:border-white px-2 py-0.5`

Edit the file now.