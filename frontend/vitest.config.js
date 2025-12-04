import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.js'],
        include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
        exclude: ['node_modules', 'dist'],
        deps: {
            inline: ['vitest-canvas-mock']
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'json-summary', 'lcov'],
            reportsDirectory: './coverage',
            include: ['src/**/*.{js,jsx}'],
            exclude: [
                'src/__tests__/**',
                'src/__mocks__/**',
                'src/main.jsx',
                'node_modules/**'
            ],
            thresholds: {
                lines: 50,
                functions: 50,
                branches: 40,
                statements: 50
            }
        }
    }
});
