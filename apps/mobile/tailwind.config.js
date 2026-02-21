/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './hooks/**/*.{js,jsx,ts,tsx}',
        './store/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                primary: '#b30f15',
                'background-dark': '#0a0a0a',
                'background-student': '#0f1115',
                'card-dark': '#1c1f26',
            },
            fontFamily: {
                display: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '16px',
                '3xl': '24px',
                '4xl': '32px',
            },
        },
    },
    plugins: [],
};
