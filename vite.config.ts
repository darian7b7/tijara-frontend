import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Polyfill __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:5001/api';
  const apiTimeout = parseInt(env.VITE_API_TIMEOUT || '10000');

  return {
    plugins: [react()],
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
        ],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@types": path.resolve(__dirname, "src/types"),
        "@api": path.resolve(__dirname, "src/api"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@components": path.resolve(__dirname, "src/components"),
        "@config": path.resolve(__dirname, "src/config"),
        "@context": path.resolve(__dirname, "src/context"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@pages": path.resolve(__dirname, "src/pages"),
        "@utils": path.resolve(__dirname, "src/utils"),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT || '3000'),
      open: env.VITE_OPEN_BROWSER === 'true',
      strictPort: false,
      cors: {
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      },
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: mode === 'production',
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, _req, _res) => {
              console.warn('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
    build: {
      outDir: env.VITE_BUILD_DIR || "dist",
      sourcemap: mode !== 'production',
      minify: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: [],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    esbuild: {
      logOverride: {
        "this-is-undefined-in-esm": "silent",
      },
    },
    define: {
      "process.env": process.env, // ensures .env vars work in frontend
    },
  };
});
