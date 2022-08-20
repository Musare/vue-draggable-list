import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        target: "esnext",
        minify: "terser",
        lib: {
            entry: "./lib/main.ts",
            name: "vue-draggable-list",
            // the proper extensions will be added
            fileName: "vue-draggable-list"
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ["vue"],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    vue: "Vue"
                }
            }
        }
    },
    plugins: [vue()]
});
