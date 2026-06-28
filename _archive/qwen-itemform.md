Apply Swiss Design System to D:\home-storage\src\pages\ItemForm.tsx.

Read the file first, then apply these changes. The logic MUST remain identical — only change className values. Use these Swiss Design classes: swiss-card, swiss-btn, swiss-btn-outline, swiss-input, swiss-enter.

NO rounded corners (remove rounded-2xl, rounded-xl, rounded-lg, rounded-full, rounded-2xl).
NO shadows (remove shadow-sm, shadow-md, shadow-lg).
NO gradients.
NO bg-primary or text-primary classes.
Replace `animate-enter` with `swiss-enter`.

Changes:
1. All `input-field` → `swiss-input`
2. All `card` → `swiss-card`
3. All `btn-primary` → `swiss-btn`
4. `animate-enter` → `swiss-enter`
5. Heading: `text-2xl font-bold flex-1 dark:text-gray-100` → `text-2xl font-black uppercase tracking-wider text-black dark:text-white flex-1`
6. Labels: `text-sm font-bold text-gray-600 dark:text-gray-300 mb-3` → `text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3`
7. Back button: remove rounded-2xl, shadow-sm, border border-gray-100. Change to: `border-2 border-black dark:border-white p-2 flex items-center justify-center`
8. Delete button: remove `rounded-2xl bg-red-50`, change to: `border-2 border-swiss-red p-2 flex items-center justify-center`
9. Category buttons — active: `bg-primary dark:bg-blue-600 text-white border-transparent shadow-md` → `bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white`
10. Category buttons — inactive: `bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-primary` → `bg-transparent text-gray-600 dark:text-gray-400 border-2 border-black dark:border-white hover:bg-black hover:text-white`
11. Quantity buttons: remove `rounded-2xl bg-gray-100 dark:bg-slate-700`, change to: `w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center font-bold text-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black`
12. Image upload area: remove `rounded-2xl`, keep everything else same
13. Image remove button: remove `rounded-full backdrop-blur-sm`, change to: `absolute top-3 right-3 w-8 h-8 bg-black/50 text-white flex items-center justify-center z-10`
14. AI button: remove `rounded-full backdrop-blur-md shadow-lg border border-white/20`, change to: `flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold border-2 border-white`
15. Upload placeholder icon: remove `rounded-2xl shadow-sm`, change to: `w-14 h-14 border-2 border-black dark:border-white flex items-center justify-center mb-3`
16. Expiry quick buttons: remove `rounded-lg`, replace orange bg with `border-2 border-black dark:border-white`. Change to: `px-3 py-1.5 text-xs font-bold border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black`
17. "清空" button: same treatment
18. Location empty state: remove `rounded-2xl`, keep as `bg-gray-50 dark:bg-gray-900 border-2 border-black dark:border-white`
19. Submit button: `btn-primary w-full py-4 text-lg` → `swiss-btn w-full py-4 text-lg`

Edit the file now.