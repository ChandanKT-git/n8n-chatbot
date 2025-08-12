import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split vendor libraries into separate chunks
                    'react-vendor': ['react', 'react-dom'],
                    'apollo-vendor': ['@apollo/client', 'graphql'],
                    'nhost-vendor': ['@nhost/react', '@nhost/react-apollo'],
                    'router-vendor': ['react-router-dom'],
                    'ui-vendor': ['lucide-react', 'date-fns']
                }
            }
        },
        chunkSizeWarningLimit: 1000, // Increase limit to 1MB
    },
    define: {
        global: 'globalThis',
    },
})