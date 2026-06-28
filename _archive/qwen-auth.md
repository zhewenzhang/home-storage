Apply Swiss Design System to D:\home-storage\src\pages\AuthPage.tsx.

Read the file first, then apply these changes. Keep ALL logic identical.

Key rules: NO rounded-*, NO shadow-*, NO bg-gradient-*, NO backdrop-blur-*, NO bg-primary, NO text-primary.

Replace ALL of the following:

1. Main container: remove `style={{ background: 'linear-gradient(135deg, ...)' }}`. Change to: `className="min-h-screen flex items-center justify-center bg-black"`
2. Remove ALL decorative background divs (the absolute circles and dots - they use gradient/rounded styles)
3. Logo container: `w-16 h-16 rounded-2xl mb-4 style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}` → `w-16 h-16 border-2 border-white mb-4 flex items-center justify-center`
4. Logo icon Sparkles → Package icon
5. Heading: `text-3xl font-bold text-white mb-2` → `text-5xl font-black text-white uppercase tracking-tighter mb-2`
6. Subtitle: `text-sm` → `text-[10px] font-bold text-white/60 uppercase tracking-wider`
7. Card: `rounded-3xl overflow-hidden bg-white/95 dark:bg-slate-900/95 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] backdrop-blur-xl border border-transparent dark:border-slate-800` → `bg-white dark:bg-black border-2 border-black dark:border-white overflow-hidden`
8. Tab container: `border-b border-gray-100 dark:border-slate-800` → `border-b-2 border-black dark:border-white`
9. Active tab: `text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-500 bg-primary/5 dark:bg-blue-500/10` → `text-black dark:text-white border-b-2 border-black dark:bg-white font-black`
10. Inactive tab: `text-gray-500 dark:text-gray-400 border-b-2 border-transparent` → `text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-black dark:hover:text-white`
11. Input labels: `text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block` → keep
12. Input fields: remove `rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/10` → `w-full px-4 py-3 border-2 border-black dark:border-white bg-transparent text-black dark:text-white placeholder-gray-400 text-sm outline-none font-medium`
13. Input icons (Mail, Lock, User): keep position but they use text-gray-400 - that's fine
14. Show/hide password button: keep
15. Error message: `px-4 py-3 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30` → `border-2 border-swiss-red bg-swiss-red/5 text-swiss-red text-xs font-bold px-4 py-3`
16. Submit button: remove `rounded-xl bg-gradient-to-r from-[#3B6D8C] to-[#2A4D63] style={{ boxShadow: '0 4px 15px rgba(59,109,140,0.3)' }}`. Change to: `w-full py-3.5 swiss-btn`
17. Bottom toggle text: `text-xs text-gray-400 dark:text-gray-500` → keep
18. Toggle link: `text-primary dark:text-blue-400 font-bold ml-1 hover:underline` → `text-black dark:text-white font-bold ml-1 hover:underline`
19. Footer text: `text-center mt-6 text-xs` → `text-center mt-6 text-[10px] text-white/40 uppercase tracking-wider`

Edit the file now.