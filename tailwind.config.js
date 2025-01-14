/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                lightblue: "#F0F2FA",
                lightred: "#C615311A",
            },
            fontSize: {
                13: "13px", // Add custom font size of 13px
            },
            lineHeight: {
                15.7: "15.7px", // Add custom line height of 15.7px
            },
        },
        fontFamily: {
            productSans: ["Product Sans", "sans-serif"], // Add Product Sans here
        },
    },
    plugins: [],
};
