/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Modern clean theme colors
        'theme-dark': '#17252A',    // Dark blue-green (headers, text)
        'theme-medium-dark': '#2B7A78', // Medium dark teal (accents, buttons)
        'theme-medium': '#3AAFA9',  // Teal (primary buttons, highlights)
        'theme-light': '#DEF2F1',   // Very light teal (backgrounds, cards)
        'theme-white': '#FEFFFF',   // Almost white (canvas, text on dark)
        
        // Previous light theme colors kept for reference/compatibility
        'light-bg-primary': '#FEFFFF',  // Canvas color
        'light-bg-secondary': '#DEF2F1', // Light background
        'light-bg-accent': '#3AAFA9',    // Teal accent
        
        'light-text-primary': '#17252A',  // Dark text
        'light-text-secondary': '#2B7A78', // Medium text
        'light-text-accent': '#3AAFA9',    // Accent text
        
        'light-border-light': '#DEF2F1',    // Light border
        'light-border-medium': '#3AAFA9',    // Medium border
        'light-border-accent': '#2B7A78',    // Dark accent border
        
        // Workflow node colors
        'light-node-general': '#DEF2F1',   // Light teal background
        'light-node-llms': '#D4F4EA',      // Light mint background
        'light-node-logic': '#E4F6F8',     // Light blue background
        'light-node-integrations': '#E4F1F6', // Light blue-gray background
        'light-node-data': '#F5F9FA',      // Very light background
      },
      backgroundImage: {
        'light-gradient': 'linear-gradient(to right bottom, #FEFFFF, #DEF2F1, #DEF2F1)',
      },
    },
  },
  plugins: [],
};
