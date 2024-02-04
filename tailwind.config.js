/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // See http://web.mta.info/developers/resources/line_colors.htm
        mta: {
          red: "#EE352E",
          orange: "#FF6319",
          yellow: "#FCCC0A",
          "light-green": "#6CBE45",
          "dark-green": "#00933C",
          blue: "#0039A6",
          purple: "#B933AD",
          "light-gray": "#A7A9AC",
          "dark-gray": "#808183",
          brown: "#996633",
        },
      },
    },
  },
  plugins: [],
};
