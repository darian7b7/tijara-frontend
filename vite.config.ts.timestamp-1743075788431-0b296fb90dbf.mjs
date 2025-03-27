// vite.config.ts
import { defineConfig } from "file:///C:/Users/nabod/Documents/project/Best%20Website/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/nabod/Documents/project/Best%20Website/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "file:///C:/Users/nabod/Documents/project/Best%20Website/frontend/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///C:/Users/nabod/Documents/project/Best%20Website/frontend/node_modules/autoprefixer/lib/autoprefixer.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/nabod/Documents/project/Best%20Website/frontend/vite.config.ts";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = path.dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer()
      ]
    }
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
      "@utils": path.resolve(__dirname, "src/utils")
    }
  },
  server: {
    port: 3e3,
    open: true,
    strictPort: false,
    cors: {
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.error("Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(`[Proxy] \u279C ${req.method} ${req.url}`);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log(
              `[Proxy] \u21E6 ${proxyRes.statusCode} ${req.url}`
            );
          });
        }
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 600
  },
  esbuild: {
    logOverride: {
      "this-is-undefined-in-esm": "silent"
    }
  },
  define: {
    "process.env": process.env
    // ensures .env vars work in frontend
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxuYWJvZFxcXFxEb2N1bWVudHNcXFxccHJvamVjdFxcXFxCZXN0IFdlYnNpdGVcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG5hYm9kXFxcXERvY3VtZW50c1xcXFxwcm9qZWN0XFxcXEJlc3QgV2Vic2l0ZVxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbmFib2QvRG9jdW1lbnRzL3Byb2plY3QvQmVzdCUyMFdlYnNpdGUvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tIFwidXJsXCI7XG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAndGFpbHdpbmRjc3MnO1xuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tICdhdXRvcHJlZml4ZXInO1xuXG4vLyBQb2x5ZmlsbCBfX2Rpcm5hbWUgZm9yIEVTTVxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShfX2ZpbGVuYW1lKTtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICBjc3M6IHtcbiAgICBwb3N0Y3NzOiB7XG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIHRhaWx3aW5kY3NzKCksXG4gICAgICAgIGF1dG9wcmVmaXhlcigpLFxuICAgICAgXSxcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyY1wiKSxcbiAgICAgIFwiQHR5cGVzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL3R5cGVzXCIpLFxuICAgICAgXCJAYXBpXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL2FwaVwiKSxcbiAgICAgIFwiQGFzc2V0c1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9hc3NldHNcIiksXG4gICAgICBcIkBjb21wb25lbnRzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL2NvbXBvbmVudHNcIiksXG4gICAgICBcIkBjb25maWdcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvY29uZmlnXCIpLFxuICAgICAgXCJAY29udGV4dFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9jb250ZXh0XCIpLFxuICAgICAgXCJAaG9va3NcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvaG9va3NcIiksXG4gICAgICBcIkBwYWdlc1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9wYWdlc1wiKSxcbiAgICAgIFwiQHV0aWxzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL3V0aWxzXCIpLFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgb3BlbjogdHJ1ZSxcbiAgICBzdHJpY3RQb3J0OiBmYWxzZSxcbiAgICBjb3JzOiB7XG4gICAgICBvcmlnaW46IHRydWUsXG4gICAgICBjcmVkZW50aWFsczogdHJ1ZSxcbiAgICAgIG1ldGhvZHM6IFtcIkdFVFwiLCBcIlBPU1RcIiwgXCJQVVRcIiwgXCJERUxFVEVcIiwgXCJPUFRJT05TXCJdLFxuICAgICAgYWxsb3dlZEhlYWRlcnM6IFtcIkNvbnRlbnQtVHlwZVwiLCBcIkF1dGhvcml6YXRpb25cIl0sXG4gICAgfSxcbiAgICBwcm94eToge1xuICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMFwiLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKFwiZXJyb3JcIiwgKGVyciwgX3JlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlByb3h5IGVycm9yOlwiLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHByb3h5Lm9uKFwicHJveHlSZXFcIiwgKHByb3h5UmVxLCByZXEpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUHJveHldIFx1Mjc5QyAke3JlcS5tZXRob2R9ICR7cmVxLnVybH1gKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcm94eS5vbihcInByb3h5UmVzXCIsIChwcm94eVJlcywgcmVxKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgYFtQcm94eV0gXHUyMUU2ICR7cHJveHlSZXMuc3RhdHVzQ29kZX0gJHtyZXEudXJsfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiBcImRpc3RcIixcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA2MDAsXG4gIH0sXG4gIGVzYnVpbGQ6IHtcbiAgICBsb2dPdmVycmlkZToge1xuICAgICAgXCJ0aGlzLWlzLXVuZGVmaW5lZC1pbi1lc21cIjogXCJzaWxlbnRcIixcbiAgICB9LFxuICB9LFxuICBkZWZpbmU6IHtcbiAgICBcInByb2Nlc3MuZW52XCI6IHByb2Nlc3MuZW52LCAvLyBlbnN1cmVzIC5lbnYgdmFycyB3b3JrIGluIGZyb250ZW5kXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1csU0FBUyxvQkFBb0I7QUFDalksT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLGtCQUFrQjtBQUx3TSxJQUFNLDJDQUEyQztBQVFsUixJQUFNLGFBQWEsY0FBYyx3Q0FBZTtBQUNoRCxJQUFNLFlBQVksS0FBSyxRQUFRLFVBQVU7QUFFekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLEtBQUs7QUFBQSxJQUNILFNBQVM7QUFBQSxNQUNQLFNBQVM7QUFBQSxRQUNQLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxNQUNmO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLFdBQVcsS0FBSztBQUFBLE1BQ2xDLFVBQVUsS0FBSyxRQUFRLFdBQVcsV0FBVztBQUFBLE1BQzdDLFFBQVEsS0FBSyxRQUFRLFdBQVcsU0FBUztBQUFBLE1BQ3pDLFdBQVcsS0FBSyxRQUFRLFdBQVcsWUFBWTtBQUFBLE1BQy9DLGVBQWUsS0FBSyxRQUFRLFdBQVcsZ0JBQWdCO0FBQUEsTUFDdkQsV0FBVyxLQUFLLFFBQVEsV0FBVyxZQUFZO0FBQUEsTUFDL0MsWUFBWSxLQUFLLFFBQVEsV0FBVyxhQUFhO0FBQUEsTUFDakQsVUFBVSxLQUFLLFFBQVEsV0FBVyxXQUFXO0FBQUEsTUFDN0MsVUFBVSxLQUFLLFFBQVEsV0FBVyxXQUFXO0FBQUEsTUFDN0MsVUFBVSxLQUFLLFFBQVEsV0FBVyxXQUFXO0FBQUEsSUFDL0M7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixNQUFNO0FBQUEsTUFDSixRQUFRO0FBQUEsTUFDUixhQUFhO0FBQUEsTUFDYixTQUFTLENBQUMsT0FBTyxRQUFRLE9BQU8sVUFBVSxTQUFTO0FBQUEsTUFDbkQsZ0JBQWdCLENBQUMsZ0JBQWdCLGVBQWU7QUFBQSxJQUNsRDtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsV0FBVyxDQUFDLE9BQU8sYUFBYTtBQUM5QixnQkFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLE1BQU0sU0FBUztBQUNyQyxvQkFBUSxNQUFNLGdCQUFnQixHQUFHO0FBQUEsVUFDbkMsQ0FBQztBQUNELGdCQUFNLEdBQUcsWUFBWSxDQUFDLFVBQVUsUUFBUTtBQUN0QyxvQkFBUSxJQUFJLGtCQUFhLElBQUksTUFBTSxJQUFJLElBQUksR0FBRyxFQUFFO0FBQUEsVUFDbEQsQ0FBQztBQUNELGdCQUFNLEdBQUcsWUFBWSxDQUFDLFVBQVUsUUFBUTtBQUN0QyxvQkFBUTtBQUFBLGNBQ04sa0JBQWEsU0FBUyxVQUFVLElBQUksSUFBSSxHQUFHO0FBQUEsWUFDN0M7QUFBQSxVQUNGLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCx1QkFBdUI7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsYUFBYTtBQUFBLE1BQ1gsNEJBQTRCO0FBQUEsSUFDOUI7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixlQUFlLFFBQVE7QUFBQTtBQUFBLEVBQ3pCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
