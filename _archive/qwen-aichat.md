Apply Swiss Design System to D:\home-storage\src\components\AIChat.tsx.

Read the file first, then apply these className changes. Keep ALL logic identical.

Key rules: NO rounded-*, NO shadow-*, NO bg-gradient-*, NO backdrop-blur-*, NO bg-primary, NO text-primary, NO CSS variable colors rgb(var(--color-*)).

Replace ALL of the following:

1. FAB buttons (camera + chat): remove `rounded-full shadow-lg shadow-xl border-2 border-white/20 hover:border-emerald-300`. Remove gradient backgrounds. Change to: `w-14 h-14 border-2 border-black dark:border-white bg-black dark:bg-white flex items-center justify-center hover:bg-swiss-red hover:border-swiss-red`
2. Camera button: same but keep icon white
3. Chat panel: remove `bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 shadow-2xl`. Remove `borderRadius: '1.5rem'` and the custom animation. Change to: `fixed bottom-32 md:bottom-24 right-4 md:right-6 z-50 flex flex-col overflow-hidden bg-white dark:bg-black border-2 border-black dark:border-white swiss-enter`
4. Panel header: remove `style={{ background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-primary-dark)) 100%)' }}`. Change to: `className="flex items-center gap-3 px-5 py-4 bg-black dark:bg-white"`
5. Header title text: `text-white` → keep for dark bg
6. Header buttons: `rounded-xl text-white/70 hover:bg-white/10` → `p-2 border-2 border-white/30 dark:border-black/30 hover:bg-swiss-red`
7. Messages container: remove backdrop/blur/rounded styles
8. User message bubble: remove `style={{ background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-primary-dark)) 100%)', borderBottomRightRadius: '6px' }}`. Change to: `className="px-4 py-3 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white"`
9. Assistant bubble: remove `rounded-2xl bg-gray-100 dark:bg-slate-800 style={{ borderBottomLeftRadius: '6px' }}`. Change to: `px-4 py-3 border-2 border-black dark:border-white bg-white dark:bg-black`
10. Welcome card: `rounded-2xl bg-blue-50 dark:bg-slate-800 border border-transparent dark:border-slate-700` → `border-2 border-black dark:border-white p-4`
11. Quick buttons: `rounded-xl border border-gray-100 dark:border-slate-700 hover:border-[#3B6D8C]` → `border-2 border-black dark:border-white p-3 text-xs font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black`
12. Pending actions card: `rounded-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-900/50 bg-[#F7FBFF] dark:bg-slate-800/80` → `border-2 border-black dark:border-white overflow-hidden`
13. Pending header: `bg-[#E3F2FD] dark:bg-blue-900/40` → `bg-black dark:bg-white`
14. Pending header text: `text-xs font-bold text-blue-800 dark:text-blue-300` → `text-xs font-bold text-white dark:text-black uppercase tracking-wider`
15. Pending action selects/inputs: replace all rounded/border styles with `border-2 border-black dark:border-white`
16. Confirm button: remove `rounded-xl bg-primary dark:bg-blue-600`. Use: `flex-1 py-2.5 text-xs font-bold uppercase swiss-btn`
17. Cancel button: remove `rounded-xl bg-gray-100 dark:bg-slate-700`. Use: `flex-1 py-2.5 text-xs font-bold uppercase border-2 border-black dark:border-white hover:bg-black hover:text-white`
18. Input area: remove `rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10`. Change to: `flex-1 px-4 py-3 border-2 border-black dark:border-white bg-transparent outline-none font-medium`
19. Send button: remove `rounded-xl bg-primary dark:bg-blue-600`. Change to: `w-10 h-10 border-2 border-black dark:border-white bg-black dark:bg-white flex items-center justify-center disabled:opacity-30`
20. Vision scanning overlay: remove `bg-black/85 backdrop-blur-xl`. Use `bg-black`
21. Vision scanning box: remove `rounded-3xl backdrop-blur-md bg-emerald-900/10 shadow-[0_0_50px_rgba(16,185,129,0.15)]`. Change to: `border-2 border-white`
22. Vision scanning text: remove `text-transparent bg-clip-text bg-gradient-to-r from-emerald-300`. Use `text-white font-black tracking-wider`
23. Remove `@keyframes chatEnter` and the style tag. Replace animation with `swiss-enter`
24. Action result badge: `rounded-xl bg-green-50 dark:bg-green-900/30` → `border border-black dark:border-white px-3 py-1.5 text-xs font-bold`
25. Delete action badge: same but with swiss-red
26. Loading spinner: `rounded-2xl bg-gray-100 dark:bg-slate-800 style={{ borderBottomLeftRadius: '6px' }}` → `px-4 py-3 border-2 border-black dark:border-white`

Edit the file now.