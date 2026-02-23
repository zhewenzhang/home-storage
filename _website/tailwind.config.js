/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2A4D63',
                accent: '#3B6D8C',
                dark: '#1a2a3a',
            }
        },
    },
    plugins: [],
}
