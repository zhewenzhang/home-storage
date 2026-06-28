import re

filepath = r"D:/home-storage/src/pages/BatchManage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove ALL rounded-2xl, rounded-xl, rounded-lg, rounded-md
content = content.replace("rounded-2xl", "")
content = content.replace("rounded-xl", "")
content = content.replace("rounded-lg", "")
content = content.replace("rounded-md", "")

# 2. Remove ALL shadow-*, shadow-sm, shadow-md
content = re.sub(r'shadow-sm\s*', '', content)
content = re.sub(r'shadow-md\s*', '', content)
content = re.sub(r'shadow-xl\s*', '', content)

# 3. animate-enter -> swiss-enter
content = content.replace("animate-enter", "swiss-enter")

# 4. Primary button style
content = content.replace(
    "bg-primary hover:bg-primary-dark dark:bg-blue-600 dark:hover:bg-blue-700",
    "bg-black dark:bg-white text-white dark:text-black hover:bg-swiss-red border-2 border-black dark:border-white font-bold uppercase"
)

# 5. Selected toolbar
content = content.replace(
    "bg-blue-50/50 dark:bg-blue-900/30 rounded-lg border border-blue-100/50 dark:border-blue-900/50 animate-enter",
    "border-2 border-black dark:border-white bg-swiss-red/5 p-2 swiss-enter"
)

# 6. Text style
content = content.replace(
    "text-blue-800 dark:text-blue-300 font-medium",
    "text-black dark:text-white font-bold"
)

# 7. btn-outline buttons
content = content.replace(
    "btn-outline px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-slate-600 transition-colors",
    "border-2 border-black dark:border-white px-3 py-1.5 text-sm font-bold uppercase text-gray-700 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center gap-1.5"
)

# 8. Table container
content = content.replace(
    "bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden",
    "border-2 border-black dark:border-white overflow-hidden"
)

# 9. Table head
content = content.replace(
    "bg-gray-50 dark:bg-slate-900/80 border-b border-gray-100 dark:border-slate-700 text-sm font-semibold text-gray-500 dark:text-gray-400",
    "bg-gray-100 dark:bg-gray-900 border-b-2 border-black dark:border-white text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400"
)

# 10. Heading h1
content = content.replace(
    "text-2xl font-bold flex items-center gap-2 text-primary-dark dark:text-blue-400",
    "text-2xl font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2"
)

# 11. Subtitle
content = content.replace(
    "text-sm text-gray-500 dark:text-gray-400 mt-1",
    "text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1"
)

# 12. Save button
content = content.replace(
    "px-6 py-2.5 text-white rounded-xl text-sm font-medium shadow-md bg-primary hover:bg-primary-dark",
    "swiss-btn"
)

# 13. Table data inputs
content = content.replace(
    "bg-transparent border-0 focus:ring-2 focus:ring-primary/30 dark:focus:ring-blue-500/30 rounded-md px-2 py-1.5 outline-none font-bold text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600",
    "bg-transparent border-0 border-b-2 border-transparent focus:border-black dark:focus:border-white outline-none px-2 py-1.5 font-bold text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600"
)

# 14. Table selects
content = content.replace(
    "w-full bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50 hover:border-gray-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-blue-500 focus:ring-1 focus:ring-primary dark:focus:ring-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-gray-600 dark:text-gray-300 transition-colors cursor-pointer",
    "w-full bg-transparent border-2 border-black dark:border-white outline-none px-2 py-1.5 text-sm font-bold"
)

# 15. Number input
content = content.replace(
    "w-16 bg-transparent border border-gray-100 dark:border-slate-700/50 hover:border-gray-200 dark:hover:border-slate-600 focus:border-primary dark:focus:border-blue-500 focus:ring-1 focus:ring-primary dark:focus:ring-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-gray-800 dark:text-gray-100 font-medium text-center transition-colors",
    "w-16 bg-transparent border-2 border-black dark:border-white outline-none px-2 py-1.5 text-sm font-bold text-center"
)

# 16. Status badges green
content = content.replace(
    "inline-block px-2 py-1 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800/50 text-green-700 dark:text-green-400 rounded-md text-xs font-semibold",
    "border-2 border-black dark:border-white text-xs font-bold uppercase px-2 py-0.5"
)

# 17. Status badges blue
content = content.replace(
    "inline-block px-2 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-primary dark:text-blue-400 rounded-md text-xs font-semibold",
    "border-2 border-black dark:border-white text-xs font-bold uppercase px-2 py-0.5"
)

# 18. text-gray-300 dark:text-gray-600 text-xs - keep as is (no change needed)

# 19. Selected row bg
content = content.replace(
    "bg-primary/5 dark:bg-blue-900/20",
    "bg-swiss-red/5"
)

# 20. Checkboxes - remove text-primary/dark:text-blue-500/focus:ring
content = content.replace(
    'w-4 h-4 rounded text-primary dark:text-blue-500 focus:ring-primary dark:focus:ring-blue-500 cursor-pointer',
    'w-4 h-4 cursor-pointer'
)
content = content.replace(
    'w-4 h-4 rounded text-primary dark:text-blue-500 focus:ring-primary dark:focus:ring-blue-500',
    'w-4 h-4'
)

# 21. Modal container
content = content.replace(
    "bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden flex flex-col border border-transparent dark:border-slate-700",
    "bg-white dark:bg-black w-full max-w-sm border-2 border-black dark:border-white overflow-hidden flex flex-col"
)

# 22. Modal header bg
content = content.replace(
    'p-5 border-b dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900',
    'p-5 border-b-2 border-black dark:border-white flex justify-between items-center bg-black dark:bg-white'
)

# 23. Modal header text
content = content.replace(
    "text-lg font-bold flex items-center gap-2 text-primary-dark dark:text-blue-400",
    "text-lg font-black uppercase tracking-wider text-white dark:text-black flex items-center gap-2"
)

# 24. Modal close
content = content.replace(
    'p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors',
    'p-2 border-2 border-white/50 dark:border-black/50 hover:bg-swiss-red'
)

# 25. Modal selects
content = content.replace(
    'input-field py-2 w-full text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-gray-200',
    'border-2 border-black dark:border-white w-full px-3 py-2 bg-transparent text-sm font-bold outline-none'
)

# 26. Modal cancel
content = content.replace(
    'px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-colors',
    'px-4 py-2 text-sm font-bold uppercase border-2 border-black dark:border-white hover:bg-black hover:text-white'
)

# 27. Modal confirm
content = content.replace(
    "px-4 py-2 text-sm text-white rounded-xl transition-all shadow-md bg-primary hover:bg-primary-dark dark:bg-blue-600 dark:hover:bg-blue-700",
    "px-4 py-2 text-sm font-bold uppercase swiss-btn"
)

# 28. Mobile card container
content = content.replace(
    'md:hidden flex flex-col divide-y divide-gray-100 dark:divide-slate-700',
    'md:hidden flex flex-col divide-y-2 divide-black dark:divide-white'
)

# 29. Mobile select bar
content = content.replace(
    'p-3 bg-gray-50 dark:bg-slate-900/80 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 dark:border-slate-700',
    'p-3 bg-gray-100 dark:bg-gray-900 flex items-center justify-between sticky top-0 z-10 border-b-2 border-black dark:border-white'
)

# Additional cleanup for mobile card status badges (rounded without -md/-xl)
content = content.replace(
    'inline-block px-1.5 py-0.5 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800/50 text-green-700 dark:text-green-400 rounded text-[10px] font-semibold',
    'border-2 border-black dark:border-white text-[10px] font-bold uppercase px-1.5 py-0.5'
)
content = content.replace(
    'inline-block px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-primary dark:text-blue-400 rounded text-[10px] font-semibold',
    'border-2 border-black dark:border-white text-[10px] font-bold uppercase px-1.5 py-0.5'
)

# Additional: mobile selects
content = content.replace(
    'w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-primary dark:focus:border-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-gray-700 dark:text-gray-200 font-medium',
    'w-full bg-transparent border-2 border-black dark:border-white outline-none px-2 py-1.5 text-sm font-bold'
)
content = content.replace(
    'w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-primary dark:focus:border-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-center text-gray-800 dark:text-gray-100 font-bold',
    'w-full bg-transparent border-2 border-black dark:border-white outline-none px-2 py-1.5 text-sm font-bold text-center'
)
content = content.replace(
    'w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-primary dark:focus:border-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-primary dark:text-blue-400 font-medium',
    'w-full bg-transparent border-2 border-black dark:border-white outline-none px-2 py-1.5 text-sm font-bold'
)

# Additional: mobile location select bg
content = content.replace(
    'bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-primary dark:focus:border-blue-500 rounded-lg',
    'bg-transparent border-2 border-black dark:border-white outline-none'
)

# Additional: mobile number input
content = content.replace(
    'w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-primary dark:focus:border-blue-500 rounded-lg px-2 py-1.5 outline-none text-sm text-center text-gray-800 dark:text-gray-100 font-bold',
    'w-full bg-transparent border-2 border-black dark:border-white outline-none px-2 py-1.5 text-sm font-bold text-center'
)

# Modal footer bg
content = content.replace(
    'p-4 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-end gap-3',
    'p-4 border-t-2 border-black dark:border-white bg-gray-50 dark:bg-slate-900 flex justify-end gap-3'
)

# Remove leftover 'rounded' that might appear as standalone class
content = re.sub(r'\brounded\b(?!\[)', '', content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Done! Swiss styles applied.")
