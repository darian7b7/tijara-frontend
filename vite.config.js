import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    // Load environment variables from `.env` files
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],

        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),  // Allows `@/components/MyComponent` instead of `../../components/MyComponent`
            },
        },

        server: {
            port: env.VITE_PORT || 3000, // Uses `.env` value or defaults to 3000
            open: env.VITE_OPEN_BROWSER === 'true', // Open browser only if set to true in `.env`
            strictPort: true, // Prevents port conflicts (won't switch to another port if 3000 is busy)
            watch: {
                usePolling: true, // Useful for WSL, Docker, or network-mounted filesystems
            },
        },

        build: {
            outDir: env.VITE_BUILD_DIR || 'dist', // Allows customizing the output directory
            sourcemap: mode === 'development', // Enables sourcemaps only in dev mode
            chunkSizeWarningLimit: 500, // Reduce chunk warning threshold to keep builds optimized
            minify: mode === 'production' ? 'terser' : false, // Minify in production, disable in dev for debugging
        },

        esbuild: {
            drop: mode === 'production' ? ['console', 'debugger'] : [], // Remove console logs in production
        },
    };
});
